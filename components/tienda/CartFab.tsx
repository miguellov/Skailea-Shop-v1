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

export function CartFab() {
  const { itemCount, openDrawer } = useCart()

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="fixed z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-skailea-deep text-skailea-cream shadow-lg shadow-skailea-deep/30 ring-2 ring-skailea-gold/40 transition hover:bg-skailea-deep/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-skailea-gold focus-visible:ring-offset-2 focus-visible:ring-offset-skailea-cream"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      aria-label={`Abrir carrito${itemCount > 0 ? `, ${itemCount} artículos` : ""}`}
    >
      <BagIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-skailea-gold px-1.5 text-xs font-bold text-skailea-deep shadow-sm">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  )
}
