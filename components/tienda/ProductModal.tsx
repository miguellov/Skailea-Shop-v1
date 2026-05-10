"use client"

import { useEffect, useRef, useState } from "react"
import { submitStoreOrder } from "@/app/admin/order-actions"
import { useCart } from "@/components/tienda/CartContext"
import { ContactOrderModal } from "@/components/tienda/ContactOrderModal"
import { ProductImageCarousel } from "@/components/tienda/ProductImageCarousel"
import { ProductImageLightbox } from "@/components/tienda/ProductImageLightbox"
import { ProductWaitlistModal } from "@/components/tienda/ProductWaitlistModal"
import { StoreToast } from "@/components/tienda/StoreToast"
import { getProductShareUrl } from "@/lib/product-links"
import type { OrderLineItem, ProductPublic } from "@/lib/types"
import {
  formatDeliveryAddressMultiline,
  formatDeliveryAddressOneLine,
} from "@/lib/delivery-format"
import {
  buildProductOrderWhatsAppMessage,
  buildProductShareWhatsAppMessage,
  formatPriceDOP,
  formatRdCartMoney,
  getProductGalleryImages,
  whatsappShareTextOnlyUrl,
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

function ShareArrowUpIcon({ className }: { className?: string }) {
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
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  )
}

function InstagramGlyphIcon({ className }: { className?: string }) {
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

function LinkIcon({ className }: { className?: string }) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastOpen, setToastOpen] = useState(false)
  const shareWrapRef = useRef<HTMLDivElement>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setToastOpen(true)
    setShareMenuOpen(false)
  }

  useEffect(() => {
    setLightboxOpen(false)
    setContactOpen(false)
    setShareMenuOpen(false)
    setWaitlistOpen(false)
    setToastOpen(false)
    setToastMessage("")
  }, [product?.id])

  useEffect(() => {
    if (!shareMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (
        shareWrapRef.current &&
        !shareWrapRef.current.contains(e.target as Node)
      ) {
        setShareMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [shareMenuOpen])

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (waitlistOpen) {
        setWaitlistOpen(false)
        e.preventDefault()
        return
      }
      if (contactOpen) {
        setContactOpen(false)
        e.preventDefault()
        return
      }
      if (shareMenuOpen) {
        setShareMenuOpen(false)
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
  }, [
    product,
    onClose,
    lightboxOpen,
    contactOpen,
    shareMenuOpen,
    waitlistOpen,
  ])

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
              ? "Este producto está agotado. Déjanos tus datos y te avisamos por WhatsApp."
              : `Disponible (${product.stock} en stock).`}
          </p>

          {out && (
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              className="w-full rounded-full border-2 border-skailea-gold/55 bg-white py-3 text-sm font-semibold text-skailea-deep shadow-sm transition hover:bg-skailea-blush/30"
            >
              🔔 Avisarme cuando llegue
            </button>
          )}

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

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-end">
              <div
                className="relative order-1 sm:order-2 sm:flex-1 sm:max-w-[12.5rem]"
                ref={shareWrapRef}
              >
                <button
                  type="button"
                  onClick={() => setShareMenuOpen((v) => !v)}
                  aria-expanded={shareMenuOpen}
                  aria-haspopup="true"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-skailea-deep/15 bg-white px-5 py-3 text-sm font-semibold text-skailea-deep shadow-sm transition hover:border-skailea-gold/45 hover:bg-skailea-cream"
                >
                  <ShareArrowUpIcon className="h-5 w-5 shrink-0 text-skailea-rose" />
                  Compartir
                </button>
                {shareMenuOpen && (
                  <div
                    className="absolute bottom-full left-0 right-0 z-[60] mb-2 overflow-hidden rounded-2xl border border-skailea-blush/45 bg-white py-1 shadow-xl sm:left-auto sm:right-0 sm:min-w-[17.5rem]"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-skailea-deep transition hover:bg-skailea-blush/35"
                      onClick={() => {
                        const msg = buildProductShareWhatsAppMessage({
                          productName: product.name,
                          priceRdLabel: formatRdCartMoney(product.price),
                        })
                        const href = whatsappShareTextOnlyUrl(msg)
                        window.open(href, "_blank", "noopener,noreferrer")
                        setShareMenuOpen(false)
                      }}
                    >
                      <span className="text-lg" aria-hidden>
                        📱
                      </span>
                      <span className="font-medium">WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-skailea-deep transition hover:bg-skailea-blush/35"
                      onClick={async () => {
                        const url = getProductShareUrl(product.id)
                        try {
                          await navigator.clipboard.writeText(url)
                          showToast(
                            "Link copiado! Pégalo en tu historia de Instagram"
                          )
                        } catch {
                          showToast(
                            "No se pudo copiar. Mantén pulsado el enlace en el navegador."
                          )
                        }
                      }}
                    >
                      <InstagramGlyphIcon className="h-5 w-5 shrink-0 text-skailea-deep" />
                      <span className="font-medium">Instagram Stories</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-skailea-deep transition hover:bg-skailea-blush/35"
                      onClick={async () => {
                        const url = getProductShareUrl(product.id)
                        try {
                          await navigator.clipboard.writeText(url)
                          showToast("Link copiado al portapapeles ✅")
                        } catch {
                          showToast(
                            "No se pudo copiar. Intenta desde el menú del navegador."
                          )
                        }
                      }}
                    >
                      <LinkIcon className="h-5 w-5 shrink-0 text-skailea-gold" />
                      <span className="font-medium">Copiar link</span>
                    </button>
                  </div>
                )}
              </div>
              {canWhatsApp ? (
                <button
                  type="button"
                  disabled={out}
                  onClick={() => !out && setContactOpen(true)}
                  className={`order-2 inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition sm:max-w-[12.5rem] ${
                    out
                      ? "cursor-not-allowed bg-skailea-charcoal/35 text-skailea-cream/80"
                      : "border-2 border-skailea-gold/50 bg-white text-[#128C7E] shadow-sm hover:bg-skailea-cream"
                  }`}
                >
                  <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" />
                  WhatsApp
                </button>
              ) : (
                <p className="order-2 text-center text-xs text-skailea-rose sm:text-right">
                  Configura NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local para pedir
                  por WhatsApp.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-skailea-deep/20 px-5 py-3 text-sm font-medium text-skailea-deep transition hover:bg-skailea-blush/40 sm:self-start"
            >
              Cerrar
            </button>
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

    <ProductWaitlistModal
      open={waitlistOpen}
      onClose={() => setWaitlistOpen(false)}
      product={product}
    />

    <StoreToast
      message={toastMessage}
      open={toastOpen}
      onClose={() => {
        setToastOpen(false)
        setToastMessage("")
      }}
    />

    <ContactOrderModal
      open={contactOpen}
      onClose={() => setContactOpen(false)}
      variant="product"
      product={product}
      onCompleted={async ({
        customerName,
        customerPhone,
        deliveryType,
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
        const deliveryMultiline =
          deliveryType === "envio"
            ? formatDeliveryAddressMultiline({
                street,
                citySector,
                province,
              })
            : null
        const result = await submitStoreOrder({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_type: deliveryType,
          delivery_address: deliveryMultiline,
          delivery_notes: deliveryNotes.trim() || null,
          items,
          total: unitPrice,
          notes: wantsMayor
            ? "Cliente indicó interés en precio por mayor."
            : null,
        })
        if (!result.success) {
          alert("Error: " + result.error)
          return
        }
        const priceStr = formatRdCartMoney(unitPrice)
        const msg = buildProductOrderWhatsAppMessage({
          customerName,
          customerPhoneDisplay: customerPhone.trim(),
          deliveryType,
          deliveryAddressOneLine:
            deliveryType === "envio"
              ? formatDeliveryAddressOneLine({
                  street,
                  citySector,
                  province,
                })
              : null,
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
