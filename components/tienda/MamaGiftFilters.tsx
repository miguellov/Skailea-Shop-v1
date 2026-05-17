"use client"

import type { MamaPriceRange } from "@/lib/mama-promo"

const RANGES: {
  id: MamaPriceRange
  emoji: string
  label: string
  sublabel: string
}[] = [
  {
    id: "under-1000",
    emoji: "🌸",
    label: "Hasta RD$1,000",
    sublabel: "Regalos accesibles",
  },
  {
    id: "1000-2000",
    emoji: "💐",
    label: "RD$1,000 - RD$2,000",
    sublabel: "Opciones destacadas",
  },
  {
    id: "over-2000",
    emoji: "👑",
    label: "Más de RD$2,000",
    sublabel: "Regalos premium",
  },
]

type Props = {
  selected: MamaPriceRange
  onSelect: (range: MamaPriceRange) => void
}

export function MamaGiftFilters({ selected, onSelect }: Props) {
  return (
    <section
      className="border-b border-[var(--mama-primary)]/15 bg-[var(--mama-soft)]/60"
      aria-labelledby="mama-gifts-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h2
          id="mama-gifts-heading"
          className="text-center font-playfair text-xl font-semibold text-skailea-charcoal sm:text-2xl"
        >
          Regalos Perfectos para Mamá 💝
        </h2>

        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {RANGES.map((r) => {
            const active = selected === r.id
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : r.id)}
                  aria-pressed={active}
                  className={`flex w-full flex-col items-center gap-1 rounded-2xl border px-4 py-5 text-center shadow-sm transition duration-200 ${
                    active
                      ? "border-[var(--mama-secondary)] bg-gradient-to-br from-[var(--mama-primary)] to-[var(--mama-secondary)] text-white shadow-md"
                      : "border-[var(--mama-primary)]/25 bg-white/90 text-skailea-charcoal hover:border-[var(--mama-primary)]/50 hover:shadow-md"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {r.emoji}
                  </span>
                  <span className="font-semibold text-sm sm:text-base">
                    {r.label}
                  </span>
                  <span
                    className={`text-xs ${
                      active ? "text-white/85" : "text-skailea-charcoal/65"
                    }`}
                  >
                    {r.sublabel}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {selected && (
          <p className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-xs font-medium text-[var(--mama-secondary)] underline-offset-2 hover:underline"
            >
              Ver todos los precios
            </button>
          </p>
        )}
      </div>
    </section>
  )
}
