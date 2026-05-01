"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { verifyAdminPin } from "@/app/admin/actions"
import { ADMIN_SESSION_KEY, isAdminSessionMarked } from "@/lib/admin-session"

export default function AdminLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (isAdminSessionMarked(sessionStorage.getItem(ADMIN_SESSION_KEY))) {
      router.replace("/admin/dashboard")
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await verifyAdminPin(pin)
      if (result.ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1")
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        setError(result.error)
        setPin("")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[var(--deep)] px-4 py-10 text-[var(--cream)]">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          Skailea Shop
        </p>
        <h1 className="mt-2 text-center font-serif text-2xl font-bold text-[var(--cream)]">
          Panel admin
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--cream)]/75">
          Introduce tu PIN (hasta 4 dígitos)
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[var(--rose)]/35 bg-[var(--deep)] p-6 shadow-lg"
        >
          <label className="block text-sm font-medium text-[var(--cream)]/90">
            PIN
            <input
              type="password"
              name="pin"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              className="mt-2 w-full rounded-xl border border-[var(--blush)]/40 bg-[var(--charcoal)]/35 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-[var(--cream)] outline-none ring-[var(--gold)] placeholder:text-[var(--cream)]/30 focus:ring-2"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 4)
                setPin(d)
              }}
              disabled={loading}
            />
          </label>

          {error && (
            <p
              className="mt-3 rounded-lg bg-[var(--rose)]/25 px-3 py-2 text-center text-sm text-[var(--cream)]"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length === 0}
            className="mt-6 w-full rounded-full bg-[var(--gold)] py-3 text-sm font-semibold text-[var(--deep)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Comprobando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--cream)]/45">
          Prueba: PIN configurado en{" "}
          <code className="text-[var(--gold)]/90">ADMIN_PIN</code> (.env.local)
        </p>
      </div>
    </div>
  )
}
