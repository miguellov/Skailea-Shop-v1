"use client"

import type { PaymentMethod } from "@/lib/types"

type Props = {
  open: boolean
  customerLabel: string
  onClose: () => void
  onChoose: (method: PaymentMethod) => void
}

const METHODS: { key: PaymentMethod; label: string; emoji: string }[] = [
  { key: "efectivo", label: "Efectivo", emoji: "💵" },
  { key: "transferencia", label: "Transferencia", emoji: "📱" },
  { key: "tarjeta", label: "Tarjeta", emoji: "💳" },
]

export function MarkPaidModal({ open, customerLabel, onClose, onChoose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-t-3xl border border-skailea-blush/50 bg-skailea-cream p-5 shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-paid-title"
      >
        <h2
          id="mark-paid-title"
          className="font-serif text-lg font-bold text-skailea-deep"
        >
          💰 Marcar como pagado
        </h2>
        <p className="mt-2 text-sm text-skailea-charcoal/85">{customerLabel}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-skailea-deep">
          Método de pago
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onChoose(m.key)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-skailea-blush/60 bg-white px-4 py-3 text-sm font-semibold text-skailea-deep transition hover:border-skailea-gold/60 hover:bg-skailea-blush/25"
            >
              <span aria-hidden>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full border border-skailea-deep/20 py-2.5 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/30"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
