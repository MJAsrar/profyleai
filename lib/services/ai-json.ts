import { GoogleGenAI } from "@google/genai"

/**
 * One place to ask Gemini for JSON, safely.
 *
 * Every call site used to do the same fragile dance: ask for JSON in the prompt, get
 * back a string that might be wrapped in markdown, then strip fences, strip control
 * characters, patch trailing commas, slice from the first `{` to the last `}` and
 * hope. A single stray token failed the whole request — on the product's core value
 * path (tailoring, cover letters, interview questions).
 *
 * Instead: ask the model for `application/json` (and a schema when we have one), so
 * the response is structurally valid by construction. Then add the things the old
 * code had none of — a timeout, retries with backoff, and truncation detection.
 */

export type AiJsonFailure =
  | "not_configured"
  | "timeout"
  | "truncated"
  | "empty"
  | "invalid_json"
  | "upstream"

export class AiJsonError extends Error {
  constructor(
    message: string,
    readonly code: AiJsonFailure,
    readonly retryable: boolean = false
  ) {
    super(message)
    this.name = "AiJsonError"
  }
}

export interface GenerateJsonOptions {
  prompt: string
  model?: string
  temperature?: number
  topP?: number
  topK?: number
  maxOutputTokens?: number
  /** 0 disables Gemini's thinking. Leave undefined for judgment/scoring tasks. */
  thinkingBudget?: number
  /** A Gemini responseSchema. When supplied, the shape is enforced, not just the syntax. */
  responseSchema?: unknown
  timeoutMs?: number
  retries?: number
}

const DEFAULT_MODEL = "gemini-2.5-flash"
const DEFAULT_TIMEOUT_MS = 45_000
const DEFAULT_RETRIES = 2

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new AiJsonError("GEMINI_API_KEY is not configured", "not_configured")
  }
  return new GoogleGenAI({ apiKey })
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Best-effort recovery for models that still wrap or pad their output.
 * With responseMimeType=application/json this should almost never be needed — it is
 * kept as a backstop, not as the primary strategy.
 */
function parseJsonLoosely<T>(text: string): T {
  try {
    return JSON.parse(text) as T
  } catch {
    let cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
      .replace(/,(\s*[}\]])/g, "$1")
      .trim()

    const start = cleaned.indexOf("{")
    const arrStart = cleaned.indexOf("[")
    const useArray = arrStart !== -1 && (start === -1 || arrStart < start)
    const open = useArray ? arrStart : start
    const close = useArray ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}")

    if (open !== -1 && close > open) {
      cleaned = cleaned.substring(open, close + 1)
    }

    try {
      return JSON.parse(cleaned) as T
    } catch (error) {
      throw new AiJsonError(
        `Model did not return valid JSON: ${(error as Error).message}`,
        "invalid_json"
      )
    }
  }
}

/** Ask Gemini for JSON and return it parsed. Throws AiJsonError on failure. */
export async function generateJson<T>(options: GenerateJsonOptions): Promise<T> {
  const {
    prompt,
    model = DEFAULT_MODEL,
    temperature = 0.3,
    topP = 0.8,
    topK = 40,
    maxOutputTokens = 4096,
    thinkingBudget,
    responseSchema,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
  } = options

  const client = getClient()

  let lastError: AiJsonError | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(
        client.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature,
            topP,
            topK,
            maxOutputTokens,
            // The whole point: valid JSON by construction, not by repair.
            responseMimeType: "application/json",
            ...(responseSchema ? { responseSchema } : {}),
            ...(thinkingBudget !== undefined
              ? { thinkingConfig: { thinkingBudget } }
              : {}),
          },
        }),
        timeoutMs
      )

      // A response cut off at the token limit is not usable — it is a truncated JSON
      // document. The old code would try to parse it and fail confusingly.
      const finishReason = response.candidates?.[0]?.finishReason
      if (finishReason === "MAX_TOKENS") {
        throw new AiJsonError(
          "Model response was cut off by the output token limit",
          "truncated"
        )
      }

      const text = response.text?.trim()
      if (!text) {
        throw new AiJsonError("Model returned an empty response", "empty", true)
      }

      return parseJsonLoosely<T>(text)
    } catch (error) {
      lastError = toAiJsonError(error)

      // Don't burn retries on failures that will deterministically repeat.
      if (!lastError.retryable || attempt === retries) {
        throw lastError
      }

      const backoffMs = 500 * 2 ** attempt
      console.warn(
        `Gemini call failed (${lastError.code}), retrying in ${backoffMs}ms — attempt ${attempt + 1}/${retries}`
      )
      await sleep(backoffMs)
    }
  }

  throw lastError ?? new AiJsonError("Unknown AI failure", "upstream")
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new AiJsonError(`AI request timed out after ${ms}ms`, "timeout", true)),
          ms
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function toAiJsonError(error: unknown): AiJsonError {
  if (error instanceof AiJsonError) return error

  const message = error instanceof Error ? error.message : String(error)
  // Rate limits, 5xx and transport hiccups are worth another shot; bad requests aren't.
  const retryable = /429|5\d\d|rate.?limit|overloaded|unavailable|ECONN|ETIMEDOUT|fetch failed/i.test(
    message
  )
  return new AiJsonError(message, "upstream", retryable)
}
