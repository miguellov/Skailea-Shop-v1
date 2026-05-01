import type { Order } from "@/lib/types"

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
    default:
      return `Hola ${name}! Te escribimos de Skailea Shop sobre tu pedido. 💛`
  }
}
