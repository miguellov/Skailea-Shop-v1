"use client"

import type { Category } from "@/lib/types"

type Props = {
  categories: Category[]
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}

export function CategoryFilter({ categories, selectedSlug, onSelect }: Props) {
  const sorted = [...categories].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )

  return (
    <div className="sticky top-0 z-30 -mx-3 border-b border-skailea-blush/35 bg-skailea-cream/92 px-3 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-skailea-gold sm:text-xs">
        Categorías
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedSlug === null
              ? "bg-skailea-deep text-skailea-cream shadow-md ring-1 ring-white/10"
              : "bg-white/70 text-skailea-deep shadow-sm ring-1 ring-skailea-blush/40 hover:bg-skailea-blush/50"
          }`}
        >
          Todas
        </button>
        {sorted.map((c) => {
          const active = selectedSlug === c.slug
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.slug)}
              className={`max-w-[220px] shrink-0 truncate rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-skailea-rose text-skailea-cream shadow-md ring-1 ring-skailea-rose/30"
                  : "bg-white/70 text-skailea-deep shadow-sm ring-1 ring-skailea-blush/40 hover:bg-skailea-blush/50"
              }`}
              title={c.name}
            >
              {c.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
