"use client"

import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (name: string, phone: string) => Promise<void>
  totalLabel: string
}

export function CartCheckoutModal({
  open,
  onClose,
  onSubmit,
  totalLabel,
}: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) {
      setName("")
      setPhone("")
      setSending(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setSending(true)
    try {
      await onSubmit(name.trim(), phone.trim())
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se pudo guardar el pedido")
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-skailea-blush/40 bg-skailea-cream p-5 shadow-xl sm:rounded-3xl">
        <h2
          id="checkout-modal-title"
          className="font-serif text-lg font-semibold text-skailea-deep sm:text-xl"
        >
          Datos para tu pedido
        </h2>
        <p className="mt-1 text-sm text-skailea-charcoal/80">
          Los usamos para confirmarte por WhatsApp. Total:{" "}
          <span className="font-semibold text-skailea-rose">{totalLabel}</span>
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3">
          <label className="block text-sm font-medium text-skailea-deep">
            Nombre
            <input
              required
              autoComplete="name"
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2.5 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </label>
          <label className="block text-sm font-medium text-skailea-deep">
            Teléfono (WhatsApp)
            <input
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2.5 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809 000 0000"
            />
          </label>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-full border border-skailea-deep/20 px-5 py-2.5 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/30 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-skailea-deep px-5 py-2.5 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
            >
              {sending ? "Guardando…" : "Continuar a WhatsApp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
