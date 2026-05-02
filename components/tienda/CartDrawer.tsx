"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { submitStoreOrder } from "@/app/admin/order-actions"
import {
  formatCartLineSubtotal,
  useCart,
} from "@/components/tienda/CartContext"
import { ContactOrderModal } from "@/components/tienda/ContactOrderModal"
import type { OrderLineItem } from "@/lib/types"
import {
  formatDeliveryAddressMultiline,
  formatDeliveryAddressOneLine,
} from "@/lib/delivery-format"
import { PAYPAL_BUTTON_DISABLED } from "@/lib/paypal-store"
import { SHIPPING_CART_LINE } from "@/lib/shipping-copy"
import {
  buildCartOrderWhatsAppMessage,
  formatRdCartMoney,
  whatsappUrl,
} from "@/lib/utils"

export function CartDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    lines,
    total,
    incrementQty,
    decrementQty,
    removeLine,
    clearCart,
    whatsappDigits,
  } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (checkoutOpen) {
        setCheckoutOpen(false)
        e.preventDefault()
        return
      }
      closeDrawer()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [drawerOpen, closeDrawer, checkoutOpen])

  if (!drawerOpen) return null

  const canWhatsApp = Boolean(whatsappDigits.replace(/\D/g, ""))

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Carrito">
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/50 backdrop-blur-[2px]"
        aria-label="Cerrar carrito"
        onClick={closeDrawer}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-full flex-col border-l border-skailea-blush/40 bg-skailea-cream shadow-2xl sm:max-w-md">
        <header className="flex shrink-0 items-center justify-between border-b border-skailea-blush/40 px-4 py-4 sm:px-5">
          <h2 className="font-serif text-xl font-bold text-skailea-deep">Carrito</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full p-2 text-skailea-deep hover:bg-skailea-blush/40"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-skailea-charcoal/75">
            <p>Tu carrito está vacío.</p>
            <button
              type="button"
              onClick={closeDrawer}
              className="mt-2 text-sm font-medium text-skailea-rose underline-offset-2 hover:underline"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="mb-3 flex gap-3 rounded-xl border border-skailea-blush/35 bg-white p-3 last:mb-0"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-skailea-blush/25">
                    {line.product.image_url ? (
                      <Image
                        src={line.product.image_url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-skailea-rose/70">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-skailea-deep">
                      {line.product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-skailea-rose">
                      {formatRdCartMoney(line.product.price)} c/u
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-skailea-deep/15 bg-skailea-cream">
                        <button
                          type="button"
                          onClick={() => decrementQty(line.productId)}
                          className="px-3 py-1.5 text-sm font-semibold text-skailea-deep hover:bg-skailea-blush/40"
                          aria-label="Menos"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-skailea-deep">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementQty(line.productId)}
                          disabled={line.quantity >= line.product.stock}
                          className="px-3 py-1.5 text-sm font-semibold text-skailea-deep hover:bg-skailea-blush/40 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Más"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        className="text-xs font-medium text-skailea-rose hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-skailea-deep">
                      Subtotal: {formatCartLineSubtotal(line)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="shrink-0 border-t border-skailea-blush/40 bg-skailea-cream px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
              <div className="mb-4 space-y-2 border-b border-skailea-gold/25 pb-3">
                <div className="flex items-center justify-between text-sm text-skailea-deep">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatRdCartMoney(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-skailea-charcoal/85">
                  <span>Envío</span>
                  <span className="text-right italic">{SHIPPING_CART_LINE}</span>
                </div>
                <div className="flex items-center justify-between border-t border-skailea-blush/40 pt-2">
                  <span className="font-semibold text-skailea-deep">
                    Total productos
                  </span>
                  <span className="font-serif text-xl font-bold text-skailea-deep">
                    {formatRdCartMoney(total)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {canWhatsApp ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-skailea-gold/45 bg-white py-3 text-sm font-semibold text-[#128C7E] shadow-md shadow-skailea-deep/10 ring-1 ring-skailea-deep/10 transition hover:bg-skailea-cream"
                  >
                    Enviar pedido por WhatsApp
                  </button>
                ) : (
                  <p className="text-center text-xs text-skailea-rose">
                    Configura NEXT_PUBLIC_WHATSAPP_NUMBER para enviar el pedido.
                  </p>
                )}
                <div className="group/paypal relative w-full">
                  <button
                    type="button"
                    disabled={PAYPAL_BUTTON_DISABLED}
                    title={
                      PAYPAL_BUTTON_DISABLED
                        ? "Próximamente disponible"
                        : "Pagar con PayPal"
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#0070BA]/40 bg-[#003087] py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070BA] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:brightness-100"
                  >
                    💳 Pagar con PayPal
                  </button>
                  {PAYPAL_BUTTON_DISABLED && (
                    <span
                      className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden w-max -translate-x-1/2 whitespace-nowrap rounded-md bg-skailea-deep px-2.5 py-1.5 font-sans text-xs font-medium text-skailea-cream shadow-lg md:block md:opacity-0 md:transition md:duration-200 md:group-hover/paypal:opacity-100"
                      role="tooltip"
                    >
                      Próximamente disponible
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearCart()
                  }}
                  className="rounded-full border border-skailea-deep/25 py-3 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/35"
                >
                  Vaciar carrito
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>

      <ContactOrderModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        variant="cart"
        cartLines={lines}
        onCompleted={async ({
          customerName,
          customerPhone,
          street,
          citySector,
          province,
          deliveryNotes,
          wantsMayor,
        }) => {
          const items: OrderLineItem[] = lines.map((l) => {
            const unit = wantsMayor ? l.product.price_mayor : l.product.price
            const q = l.quantity
            return {
              product_id: l.productId,
              name: l.product.name,
              quantity: q,
              unit_price: unit,
              line_total: unit * q,
            }
          })
          const orderTotal = items.reduce((s, i) => s + i.line_total, 0)
          const deliveryMultiline = formatDeliveryAddressMultiline({
            street,
            citySector,
            province,
          })
          await submitStoreOrder({
            customer_name: customerName,
            customer_phone: customerPhone,
            delivery_address: deliveryMultiline,
            delivery_notes: deliveryNotes.trim() || null,
            items,
            total: orderTotal,
            notes: wantsMayor
              ? "Cliente indicó precio por mayor en el pedido."
              : null,
          })
          const msg = buildCartOrderWhatsAppMessage({
            customerName,
            customerPhoneDisplay: customerPhone.trim(),
            deliveryAddressOneLine: formatDeliveryAddressOneLine({
              street,
              citySector,
              province,
            }),
            deliveryNotes: deliveryNotes.trim() || null,
            lines: items.map((i) => ({
              quantity: i.quantity,
              name: i.name,
              lineLabel: formatRdCartMoney(i.line_total),
            })),
            totalLabel: formatRdCartMoney(orderTotal),
            wantsMayor,
          })
          const href = whatsappUrl(whatsappDigits, msg)
          if (href && href !== "#") {
            window.open(href, "_blank", "noopener,noreferrer")
          }
          clearCart()
          closeDrawer()
          setCheckoutOpen(false)
        }}
      />
    </div>
  )
}
