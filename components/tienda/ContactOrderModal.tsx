"use client"

import { useEffect, useMemo, useState } from "react"
import type { CartLine } from "@/components/tienda/CartContext"
import type { ProductPublic } from "@/lib/types"
import { loadCustomerContact } from "@/lib/contact-prefs"
import { formatRdCartMoney } from "@/lib/utils"

type Props = {
  open: boolean
  onClose: () => void
  variant: "product" | "cart"
  product?: ProductPublic | null
  cartLines?: CartLine[]
  onCompleted: (payload: {
    customerName: string
    customerPhone: string
    wantsMayor: boolean
  }) => Promise<void>
}

export function ContactOrderModal({
  open,
  onClose,
  variant,
  product,
  cartLines = [],
  onCompleted,
}: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [wantsMayor, setWantsMayor] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) {
      setSending(false)
      return
    }
    const saved = loadCustomerContact()
    setName(saved?.name ?? "")
    setPhone(saved?.phone ?? "")
    setWantsMayor(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose, sending])

  const cartMayorHints = useMemo(() => {
    if (variant !== "cart" || !wantsMayor) return []
    return cartLines
      .filter((l) => l.quantity < l.product.mayor_min)
      .map((l) => ({
        name: l.product.name,
        min: l.product.mayor_min,
        qty: l.quantity,
      }))
  }, [variant, wantsMayor, cartLines])

  const cartTotals = useMemo(() => {
    if (variant !== "cart") return { retail: 0, mayor: 0 }
    const retail = cartLines.reduce(
      (s, l) => s + l.product.price * l.quantity,
      0
    )
    const mayor = cartLines.reduce(
      (s, l) => s + l.product.price_mayor * l.quantity,
      0
    )
    return { retail, mayor }
  }, [variant, cartLines])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim()
    if (!n || !p) return
    setSending(true)
    try {
      await onCompleted({
        customerName: n,
        customerPhone: p,
        wantsMayor,
      })
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "No se pudo completar el pedido"
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-order-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--deep)]/60 backdrop-blur-[3px]"
        aria-label="Cerrar"
        onClick={() => !sending && onClose()}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-[1.35rem] border border-skailea-blush/50 bg-skailea-cream p-5 shadow-2xl shadow-[var(--deep)]/20 sm:rounded-3xl sm:p-6">
        <h2
          id="contact-order-title"
          className="font-serif text-xl font-semibold leading-tight text-[var(--deep)] sm:text-2xl"
        >
          ¿A dónde enviamos tu pedido? 🛍️
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-skailea-charcoal/80">
          Completa tus datos; abriremos WhatsApp con el resumen del pedido.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 flex flex-col gap-4">
          <label className="block text-sm font-semibold text-[var(--deep)]">
            Nombre completo
            <input
              required
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-skailea-blush/70 bg-white px-3.5 py-3 text-base text-[var(--deep)] outline-none ring-[var(--gold)]/15 transition placeholder:text-skailea-charcoal/40 focus:border-skailea-gold/55 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre y apellido"
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--deep)]">
            Número de WhatsApp
            <input
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="mt-1.5 w-full rounded-xl border border-skailea-blush/70 bg-white px-3.5 py-3 text-base text-[var(--deep)] outline-none ring-[var(--gold)]/15 transition placeholder:text-skailea-charcoal/40 focus:border-skailea-gold/55 focus:ring-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809 000 0000"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-skailea-gold/35 bg-white/80 px-3 py-3 transition hover:bg-skailea-blush/20">
            <input
              type="checkbox"
              checked={wantsMayor}
              onChange={(e) => setWantsMayor(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-skailea-blush text-[var(--rose)] focus:ring-[var(--gold)]"
            />
            <span className="text-sm font-medium leading-snug text-[var(--deep)]">
              ¿Quieres precio por mayor?
            </span>
          </label>

          {variant === "product" && product && wantsMayor && (
            <div className="rounded-xl border border-skailea-gold/40 bg-gradient-to-br from-skailea-blush/35 to-white px-4 py-3 text-sm text-[var(--deep)]">
              <p className="font-semibold text-[var(--rose)]">Precio por mayor</p>
              <p className="mt-1">
                <span className="font-bold">{formatRdCartMoney(product.price_mayor)}</span>
                <span className="text-skailea-charcoal/75">
                  {" "}
                  · cantidad mínima {product.mayor_min} uds.
                </span>
              </p>
              <p className="mt-2 text-xs text-skailea-charcoal/70">
                Precio mostrado en tienda: {formatRdCartMoney(product.price)} c/u
              </p>
            </div>
          )}

          {variant === "cart" && wantsMayor && cartLines.length > 0 && (
            <div className="space-y-2 rounded-xl border border-skailea-gold/40 bg-gradient-to-br from-skailea-blush/35 to-white px-4 py-3 text-sm text-[var(--deep)]">
              <p className="font-semibold text-[var(--rose)]">
                Totales con precio por mayor
              </p>
              <p className="font-serif text-lg font-bold">
                {formatRdCartMoney(cartTotals.mayor)}
              </p>
              <p className="text-xs text-skailea-charcoal/75">
                Al por menor sería {formatRdCartMoney(cartTotals.retail)} — revisa que
                cada producto cumpla el mínimo de unidades por mayor.
              </p>
              {cartMayorHints.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-xs text-amber-900/90">
                  {cartMayorHints.map((h) => (
                    <li key={h.name}>
                      {h.name}: llevas {h.qty} uds.; mínimo por mayor {h.min} uds.
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-1 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => !sending && onClose()}
              disabled={sending}
              className="rounded-full border border-[var(--deep)]/20 px-5 py-3 text-sm font-semibold text-[var(--deep)] transition hover:bg-skailea-blush/40 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-[var(--rose)] px-5 py-3 text-sm font-semibold text-skailea-cream shadow-md shadow-[var(--deep)]/15 transition hover:brightness-105 disabled:opacity-50"
            >
              {sending ? "Guardando…" : "Enviar pedido por WhatsApp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
