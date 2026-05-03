import type { Order } from "@/lib/types"
import {
  normalizePhoneForWhatsAppRD,
  whatsappUrl,
} from "@/lib/utils"

/** Mensaje WhatsApp cuando el pedido fue cancelado (misma redacción que envío automático al cancelar). */
export function getOrderCancellationNotifyMessage(customerName: string): string {
  const name = (customerName || "cliente").trim()
  return `Hola ${name}! Lamentamos informarte que tu pedido en Skailea Shop fue cancelado. Para más información contáctanos por WhatsApp. Disculpa los inconvenientes 🙏`
}

/** `wa.me` con mensaje de cancelación, o `null` si el teléfono no es válido para WhatsApp. */
export function getOrderCancellationWhatsappUrl(
  customerName: string,
  customerPhone: string
): string | null {
  const n = normalizePhoneForWhatsAppRD(customerPhone).replace(/\D/g, "")
  if (n.length < 11) return null
  const href = whatsappUrl(n, getOrderCancellationNotifyMessage(customerName))
  return href === "#" ? null : href
}

/** Mensaje de WhatsApp según el estado actual del pedido (notificación a cliente). */
export function getOrderStatusNotifyMessage(o: Order): string {
  const name = (o.customer_name || "cliente").trim()

  switch (o.status) {
    case "nuevo":
      return `Hola ${name}! Tu pedido en Skailea Shop está siendo revisado. Te contactamos pronto! 💛`
    case "preparando":
      return `Hola ${name}! 👋 Te escribimos de Skailea Shop.\nTu pedido está siendo PREPARADO con mucho cariño.\nEn breve te avisamos cuando esté listo para despachar.\nGracias por tu compra! 🛍️✨`
    case "despachado":
      return `Hola ${name}! 🚚 Tu pedido de Skailea Shop ya fue DESPACHADO y está en camino.\nPronto lo tendrás en tus manos! 📦\nCualquier consulta estamos aquí 💛`
    case "entregado":
      return `Hola ${name}! ✅ Tu pedido fue ENTREGADO.\nEsperamos que lo disfrutes mucho!\nGracias por confiar en Skailea Shop 🌸\nTu opinión nos importa, cuéntanos qué tal! 💬`
    case "cancelado":
      return getOrderCancellationNotifyMessage(o.customer_name)
    default:
      return `Hola ${name}! Te escribimos de Skailea Shop sobre tu pedido. 💛`
  }
}
