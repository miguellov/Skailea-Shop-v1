export function formatPriceDOP(value: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Formato para carrito y WhatsApp: RD$1,200 */
export function formatRdCartMoney(value: number): string {
  const n = Math.round(value)
  return `RD$${n.toLocaleString("es-DO", { maximumFractionDigits: 0 })}`
}

export function whatsappOrderMessage(productName: string, priceLabel: string): string {
  return `Hola! Me interesa: ${productName} - ${priceLabel}`
}

export function whatsappUrl(phoneDigits: string, message: string): string {
  const n = phoneDigits.replace(/\D/g, "")
  if (!n) return "#"
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

/**
 * Normaliza teléfono para wa.me (solo dígitos).
 * República Dominicana / NANP: si no trae código de país, antepone 1.
 */
export function normalizePhoneForWhatsAppRD(raw: string): string {
  let d = raw.replace(/\D/g, "")
  if (!d) return ""
  if (d.startsWith("00")) d = d.slice(2)
  if (d.length >= 11 && d.startsWith("1")) return d
  if (d.length === 10) return `1${d}`
  return d
}

export type CartLineInput = {
  id: string
  name: string
  price: number
  quantity: number
}

export function buildCartWhatsAppMessage(lines: CartLineInput[]): string {
  const body = lines
    .map(
      (l) =>
        `- ${l.quantity}x ${l.name} - ${formatRdCartMoney(l.price * l.quantity)}`
    )
    .join("\n")
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  return `Hola! Quiero hacer un pedido:\n\n${body}\n\nTotal: ${formatRdCartMoney(total)}\n\nPor favor confirmar disponibilidad 🙏`
}

/** URLs para mostrar en carrusel: prioriza image_urls; si viene vacío, image_url */
export function getProductGalleryImages(p: {
  image_url: string | null
  image_urls?: string[] | null
}): string[] {
  const extra = p.image_urls
  if (Array.isArray(extra) && extra.length > 0) {
    const cleaned = extra.map((u) => u.trim()).filter(Boolean)
    if (cleaned.length > 0) return cleaned
  }
  const one = p.image_url?.trim()
  return one ? [one] : []
}
