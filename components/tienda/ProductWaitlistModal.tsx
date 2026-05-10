"use client"

import { useEffect, useState } from "react"
import { submitWaitlistEntry } from "@/app/waitlist-actions"
import type { ProductPublic } from "@/lib/types"

type Props = {
  open: boolean
  onClose: () => void
  product: ProductPublic
}

export function ProductWaitlistModal({ open, onClose, product }: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSending(false)
      setDone(false)
      setError(null)
      setName("")
      setPhone("")
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose, sending])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim()
    if (!n || !p) return
    setSending(true)
    setError(null)
    try {
      const result = await submitWaitlistEntry({
        product_id: product.id,
        product_name: product.name,
        customer_name: n,
        customer_phone: p,
      })
      if (!result.success) {
        setError(result.error)
        setSending(false)
        return
      }
      setDone(true)
      setSending(false)
      window.setTimeout(() => {
        setDone(false)
        onClose()
      }, 2200)
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.")
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={() => !sending && onClose()}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-skailea-blush/40 bg-skailea-cream p-5 shadow-xl sm:p-6">
        {done ? (
          <p className="text-center text-sm font-medium text-skailea-deep">
            Listo! Te avisamos pronto 🌸
          </p>
        ) : (
          <>
            <h2
              id="waitlist-modal-title"
              className="font-serif text-lg font-semibold text-skailea-deep sm:text-xl"
            >
              Te avisamos cuando llegue 🔔
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-skailea-charcoal/80">
              Te escribiremos por WhatsApp cuando este producto esté disponible
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-skailea-deep">
                Nombre
                <input
                  type="text"
                  name="waitlist-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={sending}
                  className="mt-1 w-full rounded-xl border border-skailea-blush/50 bg-white px-3 py-2.5 text-sm text-skailea-deep outline-none ring-skailea-gold/30 focus:ring-2"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-skailea-deep">
                Número de WhatsApp
                <input
                  type="tel"
                  name="waitlist-phone"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={sending}
                  className="mt-1 w-full rounded-xl border border-skailea-blush/50 bg-white px-3 py-2.5 text-sm text-skailea-deep outline-none ring-skailea-gold/30 focus:ring-2"
                  required
                />
              </label>
              {error && (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-skailea-rose py-3 text-sm font-semibold text-skailea-cream shadow-sm transition hover:brightness-105 disabled:opacity-60"
              >
                {sending ? "Guardando…" : "Notificarme"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
