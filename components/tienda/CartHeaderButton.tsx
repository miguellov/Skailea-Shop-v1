"use client"

import { useCart } from "@/components/tienda/CartContext"

function BagIcon({ className }: { className?: string }) {
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

export function CartHeaderButton() {
  const { itemCount, openDrawer } = useCart()

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-skailea-cream shadow-sm backdrop-blur-sm transition hover:bg-white/18 focus:outline-none focus-visible:ring-2 focus-visible:ring-skailea-gold focus-visible:ring-offset-2 focus-visible:ring-offset-skailea-deep"
      aria-label={`Abrir carrito${itemCount > 0 ? `, ${itemCount} artículos` : ""}`}
    >
      <BagIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-skailea-rose px-1 text-[10px] font-bold text-skailea-cream shadow-sm">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  )
}
