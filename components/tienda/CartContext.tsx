"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { ProductPublic } from "@/lib/types"
import {
  buildCartWhatsAppMessage,
  formatRdCartMoney,
  whatsappUrl,
} from "@/lib/utils"

export type CartLine = {
  productId: string
  product: ProductPublic
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  total: number
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (product: ProductPublic, amount?: number) => void
  incrementQty: (productId: string) => void
  decrementQty: (productId: string) => void
  removeLine: (productId: string) => void
  clearCart: () => void
  getOrderWhatsAppHref: () => string | null
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
  whatsappDigits,
}: {
  children: ReactNode
  whatsappDigits: string
}) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const addItem = useCallback((product: ProductPublic, amount = 1) => {
    if (product.stock <= 0) return
    const add = Math.max(1, Math.floor(amount))
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === product.id)
      if (idx === -1) {
        const q = Math.min(add, product.stock)
        return [...prev, { productId: product.id, product, quantity: q }]
      }
      const next = [...prev]
      const line = next[idx]
      const q = Math.min(line.quantity + add, product.stock)
      next[idx] = { ...line, product, quantity: q }
      return next
    })
  }, [])

  const incrementQty = useCallback((productId: string) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.productId !== productId) return line
        const max = line.product.stock
        if (line.quantity >= max) return line
        return { ...line, quantity: line.quantity + 1 }
      })
    )
  }, [])

  const decrementQty = useCallback((productId: string) => {
    setLines((prev) => {
      const next: CartLine[] = []
      for (const line of prev) {
        if (line.productId !== productId) {
          next.push(line)
          continue
        }
        if (line.quantity <= 1) continue
        next.push({ ...line, quantity: line.quantity - 1 })
      }
      return next
    })
  }, [])

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines]
  )

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.product.price * l.quantity, 0),
    [lines]
  )

  const getOrderWhatsAppHref = useCallback(() => {
    if (lines.length === 0) return null
    const n = whatsappDigits.replace(/\D/g, "")
    if (!n) return null
    const msg = buildCartWhatsAppMessage(
      lines.map((l) => ({
        id: l.productId,
        name: l.product.name,
        price: l.product.price,
        quantity: l.quantity,
      }))
    )
    return whatsappUrl(n, msg)
  }, [lines, whatsappDigits])

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      total,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      incrementQty,
      decrementQty,
      removeLine,
      clearCart,
      getOrderWhatsAppHref,
    }),
    [
      lines,
      itemCount,
      total,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      incrementQty,
      decrementQty,
      removeLine,
      clearCart,
      getOrderWhatsAppHref,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}

export function formatCartLineSubtotal(line: CartLine): string {
  return formatRdCartMoney(line.product.price * line.quantity)
}
