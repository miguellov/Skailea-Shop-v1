"use client"

import type { ReactNode } from "react"
import { CartProvider } from "@/components/tienda/CartContext"
import { CartDrawer } from "@/components/tienda/CartDrawer"
import { CartFab } from "@/components/tienda/CartFab"
import { WhatsAppFab } from "@/components/tienda/WhatsAppFab"

export function TiendaShell({
  whatsappDigits,
  children,
}: {
  whatsappDigits: string
  children: ReactNode
}) {
  return (
    <CartProvider whatsappDigits={whatsappDigits}>
      {children}
      <CartFab />
      <WhatsAppFab whatsappDigits={whatsappDigits} />
      <CartDrawer />
    </CartProvider>
  )
}
