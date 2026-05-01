"use client"

import { useCart } from "@/components/tienda/CartContext"
import { ProductImageCarousel } from "@/components/tienda/ProductImageCarousel"
import type { ProductPublic } from "@/lib/types"
import { formatPriceDOP, getProductGalleryImages } from "@/lib/utils"

type Props = {
  product: ProductPublic
  onOpen: (product: ProductPublic) => void
}

export function ProductCard({ product, onOpen }: Props) {
  const out = product.stock === 0
  const { addItem, openDrawer } = useCart()
  const gallery = getProductGalleryImages(product)

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-skailea-cream text-left shadow-sm transition duration-300 ease-out ${
        out
          ? "border-skailea-blush/25 opacity-95"
          : "border-skailea-blush/30 hover:border-skailea-gold/35 hover:shadow-xl"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-skailea-gold focus-visible:ring-offset-2 focus-visible:ring-offset-skailea-cream"
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-skailea-blush/20">
          <ProductImageCarousel urls={gallery} alt={product.name} />
          {out && (
            <span className="pointer-events-none absolute left-2 top-2 z-[4] max-w-[calc(100%-1rem)] truncate rounded-full border border-white/25 bg-skailea-deep/88 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-skailea-cream shadow-md backdrop-blur-[2px] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              Agotado
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-3 md:p-3.5">
          {product.category_name && (
            <p className="line-clamp-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-skailea-gold sm:text-[10px]">
              {product.category_name}
            </p>
          )}
          <p className="line-clamp-2 min-h-[2.25rem] font-playfair text-[13px] font-medium leading-tight tracking-tight text-skailea-deep sm:min-h-[2.5rem] sm:text-[15px] md:text-base">
            {product.name}
          </p>
          <p className="mt-auto pt-0.5 font-sans text-base font-bold tabular-nums text-skailea-rose sm:text-lg md:text-xl">
            {formatPriceDOP(product.price)}
          </p>
        </div>
      </button>
      {!out && (
        <div className="border-t border-skailea-blush/25 px-2.5 pb-2.5 pt-0 sm:px-3 sm:pb-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addItem(product, 1)
              openDrawer()
            }}
            className="w-full rounded-full bg-skailea-rose py-2 text-xs font-semibold text-skailea-cream shadow-sm transition hover:brightness-105 sm:py-2.5 sm:text-sm"
          >
            Agregar al carrito
          </button>
        </div>
      )}
    </div>
  )
}
