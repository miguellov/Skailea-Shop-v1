"use client"

import { useEffect, useState } from "react"
import { submitStoreOrder } from "@/app/admin/order-actions"
import { useCart } from "@/components/tienda/CartContext"
import { ContactOrderModal } from "@/components/tienda/ContactOrderModal"
import { ProductImageCarousel } from "@/components/tienda/ProductImageCarousel"
import { ProductImageLightbox } from "@/components/tienda/ProductImageLightbox"
import type { OrderLineItem, ProductPublic } from "@/lib/types"
import {
  formatDeliveryAddressMultiline,
  formatDeliveryAddressOneLine,
} from "@/lib/delivery-format"
import {
  buildProductOrderWhatsAppMessage,
  formatPriceDOP,
  formatRdCartMoney,
  getProductGalleryImages,
  whatsappUrl,
} from "@/lib/utils"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

type Props = {
  product: ProductPublic | null
  onClose: () => void
  whatsappDigits: string
}

export function ProductModal({ product, onClose, whatsappDigits }: Props) {
  const { addItem, openDrawer } = useCart()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    setLightboxOpen(false)
    setContactOpen(false)
  }, [product?.id])

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (contactOpen) {
        setContactOpen(false)
        e.preventDefault()
        return
      }
      if (lightboxOpen) {
        setLightboxOpen(false)
        e.preventDefault()
        return
      }
      onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [product, onClose, lightboxOpen, contactOpen])

  if (!product) return null

  const out = product.stock === 0
  const priceLabel = formatPriceDOP(product.price)
  const gallery = getProductGalleryImages(product)
  const canWhatsApp = Boolean(whatsappDigits.replace(/\D/g, ""))

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-skailea-blush/40 bg-skailea-cream shadow-xl sm:max-h-[min(88vh,640px)] sm:rounded-3xl">
        <div className="relative aspect-[4/3] w-full shrink-0 bg-skailea-blush/25 sm:aspect-video">
          <ProductImageCarousel
            urls={gallery}
            alt={product.name}
            className="h-full min-h-[200px]"
            imageClassName="object-cover"
            onRequestLightbox={(i) => {
              setLightboxIndex(i)
              setLightboxOpen(true)
            }}
          />
          {out && (
            <span className="pointer-events-none absolute left-3 top-3 z-[4] rounded-full border border-white/25 bg-skailea-deep/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-skailea-cream shadow-md backdrop-blur-[2px] sm:text-xs">
              Agotado
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          <div>
            <h2
              id="product-modal-title"
              className="font-serif text-xl font-semibold leading-tight text-skailea-deep sm:text-2xl"
            >
              {product.name}
            </h2>
            {(product.category_name || product.brand_name) && (
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-skailea-gold sm:text-xs">
                {product.category_name}
                {product.category_name && product.brand_name ? (
                  <span className="font-normal text-skailea-charcoal/75">
                    {" "}
                    · {product.brand_name}
                  </span>
                ) : (
                  product.brand_name
                )}
              </p>
            )}
          </div>

          <p className="font-sans text-2xl font-bold text-skailea-rose sm:text-3xl">
            {priceLabel}
          </p>

          <div className="rounded-2xl border border-skailea-gold/35 bg-skailea-blush/25 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-skailea-deep/80">
              Precio por mayor
            </p>
            <p className="mt-1 text-sm text-skailea-deep">
              <span className="font-semibold">{formatPriceDOP(product.price_mayor)}</span>
              <span className="text-skailea-deep/75">
                {" "}
                · mín. {product.mayor_min} uds.
              </span>
            </p>
          </div>

          <p className="text-sm text-skailea-charcoal/85">
            {out
              ? "Este producto está agotado. Escríbenos por si vuelve pronto."
              : `Disponible (${product.stock} en stock).`}
          </p>

          {!out && (
            <button
              type="button"
              onClick={() => {
                addItem(product, 1)
                openDrawer()
                onClose()
              }}
              className="w-full rounded-full bg-skailea-rose py-3 text-sm font-semibold text-skailea-cream shadow-sm transition hover:brightness-105"
            >
              Agregar al carrito
            </button>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="order-2 rounded-full border border-skailea-deep/20 px-5 py-3 text-sm font-medium text-skailea-deep transition hover:bg-skailea-blush/40 sm:order-1 sm:px-4"
            >
              Cerrar
            </button>
            {canWhatsApp ? (
              <button
                type="button"
                disabled={out}
                onClick={() => !out && setContactOpen(true)}
                className={`order-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition sm:order-2 ${
                  out
                    ? "cursor-not-allowed bg-skailea-charcoal/35 text-skailea-cream/80"
                    : "border-2 border-skailea-gold/50 bg-white text-[#128C7E] shadow-sm hover:bg-skailea-cream"
                }`}
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" />
                WhatsApp
              </button>
            ) : (
              <p className="order-1 text-center text-xs text-skailea-rose sm:order-2 sm:text-right">
                Configura NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local para pedir por WhatsApp.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    <ProductImageLightbox
      open={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
      urls={gallery}
      initialIndex={lightboxIndex}
      alt={product.name}
    />

    <ContactOrderModal
      open={contactOpen}
      onClose={() => setContactOpen(false)}
      variant="product"
      product={product}
      onCompleted={async ({
        customerName,
        customerPhone,
        street,
        citySector,
        province,
        deliveryNotes,
        wantsMayor,
      }) => {
        const unitPrice = wantsMayor ? product.price_mayor : product.price
        const items: OrderLineItem[] = [
          {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            unit_price: unitPrice,
            line_total: unitPrice,
          },
        ]
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
          total: unitPrice,
          notes: wantsMayor
            ? "Cliente indicó interés en precio por mayor."
            : null,
        })
        const priceStr = formatRdCartMoney(unitPrice)
        const msg = buildProductOrderWhatsAppMessage({
          customerName,
          customerPhoneDisplay: customerPhone.trim(),
          deliveryAddressOneLine: formatDeliveryAddressOneLine({
            street,
            citySector,
            province,
          }),
          deliveryNotes: deliveryNotes.trim() || null,
          productName: product.name,
          priceLabel: priceStr,
          wantsMayor,
          mayorPriceLabel: wantsMayor
            ? formatRdCartMoney(product.price_mayor)
            : undefined,
          mayorMin: wantsMayor ? product.mayor_min : undefined,
        })
        const href = whatsappUrl(whatsappDigits, msg)
        if (href && href !== "#") {
          window.open(href, "_blank", "noopener,noreferrer")
        }
        setContactOpen(false)
        onClose()
      }}
    />
    </>
  )
}
