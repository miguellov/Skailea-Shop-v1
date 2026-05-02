"use client"

import { useEffect, useMemo, useState } from "react"
import type { CartLine } from "@/components/tienda/CartContext"
import type { ProductPublic } from "@/lib/types"
import {
  loadCustomerContact,
  saveCustomerContact,
  type StoredCustomerContact,
} from "@/lib/contact-prefs"
import { SHIPPING_COST_DISCLAIMER_MODAL } from "@/lib/shipping-copy"
import { formatRdCartMoney } from "@/lib/utils"

export type ContactOrderCompletion = {
  customerName: string
  customerPhone: string
  street: string
  citySector: string
  province: string
  deliveryNotes: string
  wantsMayor: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  variant: "product" | "cart"
  product?: ProductPublic | null
  cartLines?: CartLine[]
  onCompleted: (payload: ContactOrderCompletion) => Promise<void>
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
  const [street, setStreet] = useState("")
  const [citySector, setCitySector] = useState("")
  const [province, setProvince] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
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
    setStreet(saved?.street ?? "")
    setCitySector(saved?.citySector ?? "")
    setProvince(saved?.province ?? "")
    setDeliveryNotes("")
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
    const st = street.trim()
    const cs = citySector.trim()
    const pr = province.trim()
    if (!n || !p || !st || !cs || !pr) return
    setSending(true)
    try {
      await onCompleted({
        customerName: n,
        customerPhone: p,
        street: st,
        citySector: cs,
        province: pr,
        deliveryNotes: deliveryNotes.trim(),
        wantsMayor,
      })
      const toSave: StoredCustomerContact = {
        name: n,
        phone: p,
        street: st,
        citySector: cs,
        province: pr,
      }
      saveCustomerContact(toSave)
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "No se pudo completar el pedido"
      )
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-skailea-blush/70 bg-white px-3.5 py-3 text-base text-[var(--deep)] outline-none ring-[var(--gold)]/15 transition placeholder:text-skailea-charcoal/40 focus:border-skailea-gold/55 focus:ring-2"

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
      <div className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-md flex-col rounded-t-[1.35rem] border border-skailea-blush/50 bg-skailea-cream shadow-2xl shadow-[var(--deep)]/20 sm:max-h-[min(90vh,720px)] sm:rounded-3xl">
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">
          <h2
            id="contact-order-title"
            className="font-serif text-xl font-semibold leading-tight text-[var(--deep)] sm:text-2xl"
          >
            ¿A dónde enviamos tu pedido? 🛍️
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-skailea-charcoal/80">
            Completa tus datos; abriremos WhatsApp con el resumen del pedido.
          </p>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="mt-5 flex flex-col gap-4"
          >
            <label className="block text-sm font-semibold text-[var(--deep)]">
              Nombre completo
              <input
                required
                autoComplete="name"
                className={inputClass}
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
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="809 000 0000"
              />
            </label>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--deep)]">
              Dirección de envío
            </p>
            <label className="block text-sm font-semibold text-[var(--deep)]">
              Calle y número
              <input
                required
                autoComplete="street-address"
                className={inputClass}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ej. Calle Duarte 12"
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--deep)]">
              Ciudad / Sector
              <input
                required
                autoComplete="address-level2"
                className={inputClass}
                value={citySector}
                onChange={(e) => setCitySector(e.target.value)}
                placeholder="Ej. Sosúa, Centro"
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--deep)]">
              Provincia
              <input
                required
                autoComplete="address-level1"
                className={inputClass}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Ej. Puerto Plata"
              />
            </label>

            <div className="rounded-xl border border-skailea-gold/50 bg-skailea-blush/25 px-3.5 py-3 text-sm leading-snug">
              <p className="font-medium text-skailea-gold">
                {SHIPPING_COST_DISCLAIMER_MODAL}
              </p>
            </div>

            <label className="block text-sm font-semibold text-[var(--deep)]">
              ¿Alguna instrucción especial?{" "}
              <span className="font-normal text-skailea-charcoal/65">
                (opcional)
              </span>
              <textarea
                rows={2}
                className={`${inputClass} min-h-[72px] resize-y`}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Referencias, horario de entrega, etc."
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
                  <span className="font-bold">
                    {formatRdCartMoney(product.price_mayor)}
                  </span>
                  <span className="text-skailea-charcoal/75">
                    {" "}
                    · cantidad mínima {product.mayor_min} uds.
                  </span>
                </p>
                <p className="mt-2 text-xs text-skailea-charcoal/70">
                  Precio mostrado en tienda: {formatRdCartMoney(product.price)}{" "}
                  c/u
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
                  Al por menor sería {formatRdCartMoney(cartTotals.retail)} —
                  revisa que cada producto cumpla el mínimo de unidades por mayor.
                </p>
                {cartMayorHints.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-xs text-amber-900/90">
                    {cartMayorHints.map((h) => (
                      <li key={h.name}>
                        {h.name}: llevas {h.qty} uds.; mínimo por mayor {h.min}{" "}
                        uds.
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
    </div>
  )
}
