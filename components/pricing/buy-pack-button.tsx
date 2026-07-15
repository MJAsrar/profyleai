"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { CreditPackageId } from "@/lib/types/credits"

/**
 * A pricing-page pack button that actually buys the pack.
 *
 * Signed in → POST /api/credits/purchase for this specific pack and go straight to Stripe.
 * Signed out → send them to sign up (they get 10 free credits and can buy after).
 *
 * The old buttons linked to /signup unconditionally, so a logged-in user browsing pricing
 * could never buy — the whole reason "Buy credits" felt broken.
 */
export function BuyPackButton({
  packageId,
  popular,
}: {
  packageId: CreditPackageId
  popular?: boolean
}) {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function buy() {
    if (status !== "authenticated") {
      router.push("/signup")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      })
      const body = await res.json()
      const url = body?.data?.checkoutUrl

      if (!res.ok || !url) {
        toast.error(body?.error ?? "Couldn't open checkout. You haven't been charged.")
        return
      }
      window.location.href = url
    } catch {
      toast.error("Couldn't open checkout. You haven't been charged.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={buy}
      disabled={loading}
      className={cn(
        "mt-auto rounded-[10px] py-[11px] text-center text-[14px] disabled:opacity-60",
        popular
          ? "bg-[#f4efe6] font-bold text-[#22322a] hover:bg-white"
          : "border border-[#2e6a4a] font-semibold text-[#2e6a4a] hover:bg-[#2e6a4a] hover:text-[#f4efe6]"
      )}
    >
      {loading ? "Opening…" : "Buy credits"}
    </button>
  )
}
