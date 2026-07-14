"use client"

import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, FieldLabel } from "@/components/ui/input"
import { CreditPurchaseModal } from "@/components/credits/credit-purchase-modal"
import { useCredits } from "@/lib/hooks/use-credits"
import { cn } from "@/lib/utils"

interface AccountData {
  email: string
  emailVerified: string | null
  createdAt: string
  accounts: Array<{ provider: string; type: string }>
}

const SECTIONS = [
  { key: "profile", label: "Profile" },
  { key: "credits", label: "Credits" },
  { key: "security", label: "Security" },
  { key: "data", label: "Your data" },
] as const

type SectionKey = (typeof SECTIONS)[number]["key"]

/**
 * Settings.
 *
 * Everything on this page changes something real. The previous version had a Preferences
 * tab with switches for email notifications, push notifications, sound, crash reports and
 * analytics — none of them wired to anything. They were written to localStorage and read
 * by nobody, and the preferences API returned a hardcoded object. A switch that switches
 * nothing is worse than no switch: it tells you you've turned something off when you
 * haven't.
 *
 * The Appearance section is gone for the same reason. The app is light-only now (the design
 * has a single palette, and half the chrome is pinned to its literal hexes), so a theme
 * picker would be three radio buttons that change nothing.
 */
export function SettingsContent() {
  const [section, setSection] = useState<SectionKey>("profile")

  return (
    <div className="mx-auto w-full max-w-[900px] px-8 py-8">
      <h1 className="font-display text-[30px] leading-tight text-ink">Settings</h1>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* ---- Rail ---- */}
        <nav aria-label="Settings sections" className="lg:w-[180px] lg:shrink-0">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setSection(s.key)}
                  aria-current={section === s.key ? "page" : undefined}
                  className={cn(
                    "w-full whitespace-nowrap rounded-[10px] px-3 py-2 text-left text-[14px] transition-colors",
                    section === s.key
                      ? "bg-brand-tint font-semibold text-brand-deep"
                      : "text-ink-muted hover:bg-section-tint hover:text-ink"
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- Panel ---- */}
        <div className="min-w-0 flex-1">
          {section === "profile" && <ProfileSection />}
          {section === "credits" && <CreditsSection />}
          {section === "security" && <SecuritySection />}
          {section === "data" && <DataSection />}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ profile */

function ProfileSection() {
  const { data: session, update } = useSession()

  const [name, setName] = useState("")
  const [account, setAccount] = useState<AccountData | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((b) => setName(b.name ?? ""))
      .catch(() => {})

    fetch("/api/user/account")
      .then((r) => r.json())
      .then(setAccount)
      .catch(() => {})
  }, [])

  async function save() {
    setIsSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error()

      await update({ name })
      toast.success("Saved.")
    } catch {
      toast.error("Couldn't save that. Try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const memberSince = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <Card className="p-6">
      <h2 className="font-display text-[22px] leading-tight text-ink">Profile</h2>

      <div className="mt-5">
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.06em] text-ink-faint">
          This is the name that goes on your cover letters.
        </p>
      </div>

      <div className="mt-4">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" value={session?.user?.email ?? ""} readOnly disabled />
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.06em] text-ink-faint">
          Your email is your login — it can&apos;t be changed here.
          {memberSince && ` With us since ${memberSince}.`}
        </p>
      </div>

      <Button className="mt-5" onClick={save} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save"}
      </Button>
    </Card>
  )
}

/* ------------------------------------------------------------------ credits */

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  createdAt: string
}

function CreditsSection() {
  const { balance } = useCredits()

  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [showBuy, setShowBuy] = useState(false)

  useEffect(() => {
    fetch("/api/credits/transactions?limit=15")
      .then((r) => r.json())
      .then((b) => setTransactions(b?.data?.transactions ?? []))
      .catch(() => setTransactions([]))
  }, [])

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Balance
            </p>
            <p className="mt-1 font-display text-[34px] leading-none text-ink">
              {balance ?? "—"}
              <span className="ml-2 text-[15px] text-ink-faint">credits</span>
            </p>
          </div>

          <Button onClick={() => setShowBuy(true)}>Top up</Button>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
          Credits don&apos;t expire and there&apos;s no subscription. If a generation fails,
          the credit comes back automatically.
        </p>
      </Card>

      <Card className="mt-5 overflow-hidden p-0">
        <p className="border-b border-border px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Recent activity
        </p>

        {transactions === null ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-section-tint" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="p-5 text-[14px] text-ink-muted">
            Nothing yet. Credits you spend, earn and get refunded will show up here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-ink-2">
                    {tx.description ?? tx.type.replace(/_/g, " ").toLowerCase()}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 font-mono text-[13px] font-semibold tabular-nums",
                    tx.amount > 0 ? "text-brand" : "text-ink-muted"
                  )}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CreditPurchaseModal
        isOpen={showBuy}
        onClose={() => setShowBuy(false)}
        currentBalance={balance ?? undefined}
      />
    </>
  )
}

/* ----------------------------------------------------------------- security */

function SecuritySection() {
  const [account, setAccount] = useState<AccountData | null>(null)

  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch("/api/user/account")
      .then((r) => r.json())
      .then(setAccount)
      .catch(() => {})
  }, [])

  // A Google-only account has no password for us to change — saying so is more useful
  // than showing three fields that can never succeed.
  const isGoogleOnly =
    account !== null &&
    account.accounts.length > 0 &&
    account.accounts.every((a) => a.provider !== "credentials")

  async function change() {
    if (next !== confirm) {
      toast.error("The two new passwords don't match.")
      return
    }
    if (next.length < 8) {
      toast.error("Use at least 8 characters.")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const body = await res.json()

      if (!res.ok) {
        toast.error(body.error ?? "That didn't work.")
        return
      }

      setCurrent("")
      setNext("")
      setConfirm("")
      toast.success("Password changed.")
    } catch {
      toast.error("That didn't work. Try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isGoogleOnly) {
    return (
      <Card className="p-6">
        <h2 className="font-display text-[22px] leading-tight text-ink">Security</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          You sign in with Google, so there&apos;s no password here to change. Your account
          security lives in your Google account.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-[22px] leading-tight text-ink">Change password</h2>

      <div className="mt-5 space-y-4">
        <div>
          <FieldLabel htmlFor="current">Current password</FieldLabel>
          <Input
            id="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div>
          <FieldLabel htmlFor="new">New password</FieldLabel>
          <Input
            id="new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
          />
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.06em] text-ink-faint">
            At least 8 characters.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="confirm-new">Confirm new password</FieldLabel>
          <Input
            id="confirm-new"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button
        className="mt-5"
        onClick={change}
        disabled={isSaving || !current || !next || !confirm}
      >
        {isSaving ? "Changing…" : "Change password"}
      </Button>
    </Card>
  )
}

/* --------------------------------------------------------------------- data */

function DataSection() {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  async function exportData() {
    setIsExporting(true)
    try {
      const res = await fetch("/api/user/export-data", { method: "POST" })
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "profyleai-data.json"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("The export failed. Try again in a moment.")
    } finally {
      setIsExporting(false)
    }
  }

  async function deleteAccount() {
    setIsDeleting(true)
    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" })
      if (!res.ok) throw new Error()

      await signOut({ callbackUrl: "/" })
    } catch {
      toast.error("We couldn't delete the account. Nothing has been removed.")
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="font-display text-[22px] leading-tight text-ink">Take your data</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Everything you&apos;ve written — résumés, cover letters, interview answers — in one
          JSON file. It&apos;s yours.
        </p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={exportData}
          disabled={isExporting}
        >
          {isExporting ? "Preparing…" : "Download my data"}
        </Button>
      </Card>

      <Card className="mt-5 border-danger/40 p-6">
        <h2 className="font-display text-[22px] leading-tight text-ink">
          Delete your account
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          This removes your account and everything in it — every résumé, every letter, every
          interview — permanently. Unspent credits are not refunded. There is no undo, so
          consider downloading your data first.
        </p>

        {/* Typing the word is the point: the old flow deleted everything behind a single
            button, and the API asks for no confirmation of its own. */}
        <div className="mt-4 max-w-[280px]">
          <FieldLabel htmlFor="confirm-delete">Type DELETE to confirm</FieldLabel>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>

        <Button
          variant="destructive"
          className="mt-4"
          onClick={deleteAccount}
          disabled={confirmText !== "DELETE" || isDeleting}
        >
          {isDeleting ? "Deleting…" : "Delete everything"}
        </Button>
      </Card>
    </>
  )
}
