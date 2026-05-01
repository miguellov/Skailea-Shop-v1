"use client"

import { useMemo, useState } from "react"
import type { Category, ProductPublic } from "@/lib/types"
import { CategoryFilter } from "@/components/tienda/CategoryFilter"
import { ProductCard } from "@/components/tienda/ProductCard"
import { ProductModal } from "@/components/tienda/ProductModal"
import { StoreLogo } from "@/components/tienda/StoreLogo"

type Props = {
  categories: Category[]
  products: ProductPublic[]
  whatsappDigits: string
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function CatalogoCliente({ categories, products, whatsappDigits }: Props) {
  const [slug, setSlug] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState<ProductPublic | null>(null)

  const filtered = useMemo(() => {
    const q = searchQuery.trim()
    const qLower = q.toLowerCase()

    if (products.length === 0) return []

    if (q) {
      return products.filter((p) => {
        const name = p.name.toLowerCase()
        const cat = (p.category_name ?? "").toLowerCase()
        const slugWords = (p.category_slug ?? "").replace(/-/g, " ").toLowerCase()
        return (
          name.includes(qLower) ||
          cat.includes(qLower) ||
          slugWords.includes(qLower)
        )
      })
    }

    if (!slug) return products
    return products.filter((p) => p.category_slug === slug)
  }, [products, slug, searchQuery])

  const emptyCatalog = products.length === 0
  const searchTrimmed = searchQuery.trim()
  const showSearchEmpty =
    !emptyCatalog && searchTrimmed.length > 0 && filtered.length === 0
  const showCategoryEmpty =
    !emptyCatalog &&
    searchTrimmed.length === 0 &&
    slug !== null &&
    filtered.length === 0

  return (
    <>
      <header className="skailea-header-gradient text-skailea-cream shadow-lg shadow-black/20">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center px-4 text-center sm:px-6">
            <StoreLogo variant="header" priority />
            <p className="mt-2 max-w-md text-[11px] font-normal leading-relaxed text-skailea-gold sm:text-xs">
              Beauty · Fragrance · Wellness · República Dominicana
            </p>
          </div>

          <div className="relative mt-5 w-full">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar productos
            </label>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-skailea-gold/90" />
            <input
              id="catalog-search"
              type="search"
              autoComplete="off"
              placeholder="Buscar fragancias, categorías…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/12 py-3.5 pl-12 pr-11 text-sm text-skailea-cream shadow-inner outline-none ring-skailea-gold/35 placeholder:text-skailea-cream/45 backdrop-blur-sm focus:border-skailea-gold/45 focus:ring-2 sm:py-4 sm:text-base"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-skailea-cream/80 hover:bg-white/15 hover:text-skailea-cream"
                aria-label="Limpiar búsqueda"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="skailea-hero-surface border-b border-skailea-blush/30">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12">
          <h2 className="max-w-xl font-serif text-2xl font-medium leading-tight text-skailea-deep sm:text-3xl md:text-4xl">
            Descubre tu fragancia perfecta
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-skailea-charcoal/80 sm:text-base">
            Selección curada de belleza y bienestar. Toca un producto para ver
            precio por mayor y armar tu pedido por WhatsApp.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-3 pb-28 pt-1 sm:px-6 sm:pb-32">
        <CategoryFilter categories={categories} selectedSlug={slug} onSelect={setSlug} />

        {emptyCatalog ? (
          <p className="py-20 text-center text-sm font-medium text-skailea-charcoal/70">
            No hay productos aún
          </p>
        ) : showSearchEmpty ? (
          <p className="py-20 text-center text-sm text-skailea-charcoal/75">
            No encontramos productos para &apos;{searchTrimmed}&apos;
          </p>
        ) : showCategoryEmpty ? (
          <p className="py-20 text-center text-sm text-skailea-charcoal/70">
            No hay productos en esta categoría.
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 items-stretch gap-2.5 min-[480px]:gap-3 sm:mt-6 md:grid-cols-3 md:gap-3.5 xl:grid-cols-4 xl:gap-4">
            {filtered.map((p) => (
              <li key={p.id} className="min-w-0">
                <ProductCard product={p} onOpen={setOpen} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <ProductModal
        product={open}
        onClose={() => setOpen(null)}
        whatsappDigits={whatsappDigits}
      />
    </>
  )
}
