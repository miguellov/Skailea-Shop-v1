"use client"

import type { Brand, Category } from "@/lib/types"

type Props = {
  categories: Category[]
  brands: Brand[]
  selectedCategorySlug: string | null
  selectedBrandId: string | null
  onSelectCategory: (slug: string | null) => void
  onSelectBrand: (brandId: string | null) => void
}

export function CatalogFilters({
  categories,
  brands,
  selectedCategorySlug,
  selectedBrandId,
  onSelectCategory,
  onSelectBrand,
}: Props) {
  const sortedCats = [...categories].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )

  return (
    <div className="sticky top-0 z-30 -mx-3 space-y-4 border-b border-skailea-blush/35 bg-skailea-cream/92 px-3 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-skailea-gold sm:text-xs">
          Categoría
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategorySlug === null
                ? "bg-skailea-deep text-skailea-cream shadow-md ring-1 ring-white/10"
                : "bg-white/70 text-skailea-deep shadow-sm ring-1 ring-skailea-blush/40 hover:bg-skailea-blush/50"
            }`}
          >
            Todas
          </button>
          {sortedCats.map((c) => {
            const active = selectedCategorySlug === c.slug
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCategory(c.slug)}
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

      {brands.length > 0 && (
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-skailea-gold sm:text-xs">
            Marca
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onSelectBrand(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedBrandId === null
                  ? "bg-skailea-deep text-skailea-cream shadow-md ring-1 ring-white/10"
                  : "bg-white/70 text-skailea-deep shadow-sm ring-1 ring-skailea-blush/40 hover:bg-skailea-blush/50"
              }`}
            >
              Todas
            </button>
            {brands.map((b) => {
              const active = selectedBrandId === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBrand(b.id)}
                  className={`max-w-[200px] shrink-0 truncate rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-skailea-gold/90 text-skailea-deep shadow-md ring-1 ring-skailea-gold/40"
                      : "bg-white/70 text-skailea-deep shadow-sm ring-1 ring-skailea-blush/40 hover:bg-skailea-blush/50"
                  }`}
                  title={b.name}
                >
                  {b.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
