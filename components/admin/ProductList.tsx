"use client"

import Image from "next/image"
import type { Category, Product } from "@/lib/types"
import { formatPriceDOP } from "@/lib/utils"

type Props = {
  products: Product[]
  categories: Category[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void | Promise<void>
  onToggleStock: (id: string) => void | Promise<void>
  disabled?: boolean
}

function categoryName(categories: Category[], categoryId: string | null) {
  if (!categoryId) return "—"
  return categories.find((c) => c.id === categoryId)?.name ?? "—"
}

export function ProductList({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleStock,
  disabled = false,
}: Props) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-skailea-blush/60 bg-skailea-blush/20 px-4 py-8 text-center text-sm text-skailea-deep/80">
        No hay productos. Añade uno nuevo.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {products.map((p) => {
        const out = p.stock === 0
        return (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl border border-skailea-blush/40 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-skailea-blush/25 sm:h-20 sm:w-20">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-skailea-rose/70">
                  Sin img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-skailea-deep">{p.name}</p>
              <p className="text-xs text-skailea-rose">
                {categoryName(categories, p.category_id)}
              </p>
              <p className="mt-1 text-sm text-skailea-deep">
                {formatPriceDOP(p.price)}
                <span className="text-skailea-charcoal/70">
                  {" "}
                  · Stock: {p.stock}
                </span>
                {out && (
                  <span className="ml-2 rounded-full bg-skailea-charcoal px-2 py-0.5 text-xs text-skailea-cream">
                    Agotado
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0 sm:flex-col sm:items-stretch">
              <button
                type="button"
                onClick={() => onEdit(p)}
                disabled={disabled}
                className="rounded-full bg-skailea-gold/35 px-3 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-gold/50 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => void onToggleStock(p.id)}
                disabled={disabled}
                className="rounded-full bg-skailea-blush/50 px-3 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-blush disabled:opacity-50"
              >
                {out ? "Reponer" : "Agotar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(`¿Eliminar “${p.name}”?`)
                  ) {
                    void onDelete(p.id)
                  }
                }}
                disabled={disabled}
                className="rounded-full border border-skailea-rose/40 px-3 py-2 text-xs font-semibold text-skailea-rose hover:bg-skailea-rose/10 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
