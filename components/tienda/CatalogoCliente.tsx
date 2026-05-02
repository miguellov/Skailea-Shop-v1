"use client"

import { useMemo, useState } from "react"
import type { Brand, Category, ProductPublic } from "@/lib/types"
import {
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
  WA_FLOAT_MESSAGE,
} from "@/lib/site"
import { CatalogFilters } from "@/components/tienda/CatalogFilters"
import { ProductCard } from "@/components/tienda/ProductCard"
import { ProductModal } from "@/components/tienda/ProductModal"
import { StoreLogo } from "@/components/tienda/StoreLogo"

type Props = {
  categories: Category[]
  brands: Brand[]
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.325 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.325 3.608-.975.975-2.242 1.263-3.608 1.325-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.325-.975-.975-1.263-2.242-1.325-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608.975-.975 2.242-1.263 3.608-1.325C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.155 0-3.535.012-4.787.068-1.17.054-1.805.248-2.228.412-.56.216-.96.474-1.38.894-.42.42-.678.82-.894 1.38-.164.423-.358 1.058-.412 2.228-.056 1.252-.068 1.632-.068 4.787s.012 3.535.068 4.787c.054 1.17.248 1.805.412 2.228.216.56.474.96.894 1.38.42.42.82.678 1.38.894.423.164 1.058.358 2.228.412 1.252.056 1.632.068 4.787.068s3.535-.012 4.787-.068c1.17-.054 1.805-.248 2.228-.412.56-.216.96-.474 1.38-.894.42-.42.678-.82.894-1.38.164-.423.358-1.058.412-2.228.056-1.252.068-1.632.068-4.787s-.012-3.535-.068-4.787c-.054-1.17-.248-1.805-.412-2.228-.216-.56-.474-.96-.894-1.38-.42-.42-.82-.678-1.38-.894-.423-.164-1.058-.358-2.228-.412-1.252-.056-1.632-.068-4.787-.068zm0 4.883a3.333 3.333 0 1 1 0 6.666 3.333 3.333 0 0 1 0-6.666zm0 8.444a5.111 5.111 0 1 0 0-10.222 5.111 5.111 0 0 0 0 10.222zm6.538-.222a1.185 1.185 0 1 0-2.37 0 1.185 1.185 0 0 0 2.37 0z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.688 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function CatalogoCliente({
  categories,
  brands,
  products,
  whatsappDigits,
}: Props) {
  const [categorySlug, setCategorySlug] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)
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
        const brand = (p.brand_name ?? "").toLowerCase()
        return (
          name.includes(qLower) ||
          cat.includes(qLower) ||
          slugWords.includes(qLower) ||
          brand.includes(qLower)
        )
      })
    }

    let list = products
    if (categorySlug) {
      list = list.filter((p) => p.category_slug === categorySlug)
    }
    if (brandId) {
      list = list.filter((p) => p.brand_id === brandId)
    }
    return list
  }, [products, categorySlug, brandId, searchQuery])

  const emptyCatalog = products.length === 0
  const searchTrimmed = searchQuery.trim()
  const showSearchEmpty =
    !emptyCatalog && searchTrimmed.length > 0 && filtered.length === 0
  const showFilterEmpty =
    !emptyCatalog &&
    searchTrimmed.length === 0 &&
    (categorySlug !== null || brandId !== null) &&
    filtered.length === 0

  return (
    <>
      <header className="skailea-header-gradient text-skailea-cream shadow-lg shadow-black/20">
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-4 sm:px-6 md:py-6">
          <div className="grid w-full grid-cols-1 items-center md:grid-cols-3 md:gap-4 lg:gap-10">
            <div className="hidden justify-self-start md:flex">
              <a
                href={SITE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${SITE_INSTAGRAM_HANDLE}`}
                className="group rounded-lg px-1 py-1 transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
              >
                <span className="flex items-center gap-2 text-xs text-skailea-blush sm:text-sm">
                  <InstagramIcon className="h-5 w-5 shrink-0" />
                  <span className="font-medium tracking-wide">
                    {SITE_INSTAGRAM_HANDLE}
                  </span>
                </span>
              </a>
            </div>

            <div className="flex flex-col items-center px-2 py-3 text-center sm:px-4 sm:py-4 md:py-6">
              <StoreLogo
                variant="header"
                headerShape="circle"
                priority
              />
              <h1 className="skailea-brand-title mt-3 max-w-[18ch] text-[1.8rem] leading-none sm:max-w-none sm:text-[2rem] md:mt-4 md:text-[2.5rem]">
                SKAILEA SHOP
              </h1>
              <p className="skailea-tagline-fade mt-2.5 max-w-lg text-[10px] font-normal leading-snug sm:text-xs md:mt-3.5">
                ✨ Tu Aroma Deja Huella ✨
              </p>
            </div>

            <div className="hidden justify-self-end md:flex">
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(WA_FLOAT_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escríbenos por WhatsApp"
                className="group rounded-lg px-1 py-1 transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
              >
                <span className="flex items-center gap-2 text-xs text-[#25D366] sm:text-sm">
                  <WhatsAppIcon className="h-5 w-5 shrink-0" />
                  <span className="font-medium tracking-wide">Escríbenos</span>
                </span>
              </a>
            </div>
          </div>

          <div className="relative mt-5 w-full md:mt-6">
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
        <CatalogFilters
          categories={categories}
          brands={brands}
          selectedCategorySlug={categorySlug}
          selectedBrandId={brandId}
          onSelectCategory={setCategorySlug}
          onSelectBrand={setBrandId}
        />

        {emptyCatalog ? (
          <p className="py-20 text-center text-sm font-medium text-skailea-charcoal/70">
            No hay productos aún
          </p>
        ) : showSearchEmpty ? (
          <p className="py-20 text-center text-sm text-skailea-charcoal/75">
            No encontramos productos para &apos;{searchTrimmed}&apos;
          </p>
        ) : showFilterEmpty ? (
          <p className="py-20 text-center text-sm text-skailea-charcoal/70">
            No hay productos con los filtros seleccionados.
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
