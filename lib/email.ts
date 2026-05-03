import { Resend } from "resend"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type OrderNotificationEmailItem = {
  name: string
  quantity: number
  unit_price: number
}

export async function sendOrderNotification(order: {
  customer_name: string
  customer_phone: string
  items: OrderNotificationEmailItem[]
  total: number
  delivery_type: string
  delivery_address?: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no está configurada")
  }

  const resend = new Resend(apiKey)

  const itemsList = order.items
    .map(
      (i) =>
        `• ${i.quantity}x ${i.name} — RD$${(i.unit_price * i.quantity).toLocaleString("es-DO")}`
    )
    .join("\n")

  const safeName = escapeHtml(order.customer_name)
  const safePhone = escapeHtml(order.customer_phone)
  const safeAddr = order.delivery_address
    ? escapeHtml(order.delivery_address)
    : ""
  const safeItemsList = escapeHtml(itemsList)

  const { error } = await resend.emails.send({
    from: "Skailea Shop <onboarding@resend.dev>",
    to: process.env.NOTIFICATION_EMAIL?.trim() || "skaileashop@gmail.com",
    subject: `🛍️ Nuevo pedido — ${order.customer_name}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A1F6B; padding: 20px; text-align: center;">
          <h1 style="color: #C9A96E; margin: 0;">Skailea Shop</h1>
          <p style="color: white; margin: 5px 0;">Tu Aroma Deja Huella 🌸</p>
        </div>
        <div style="padding: 24px; background: #F7F5FF;">
          <h2 style="color: #0A1F6B;">🛍️ Nuevo Pedido</h2>
          <p><strong>Cliente:</strong> ${safeName}</p>
          <p><strong>WhatsApp:</strong> ${safePhone}</p>
          <p><strong>Entrega:</strong> ${order.delivery_type === "retiro" ? "🏪 Retiro en tienda" : "🚚 Envío a domicilio"}</p>
          ${order.delivery_address ? `<p><strong>Dirección:</strong> ${safeAddr}</p>` : ""}
          <hr style="border: 1px solid #E8C4B8;"/>
          <h3 style="color: #2952CC;">Productos:</h3>
          <pre style="background: white; padding: 12px; border-radius: 8px;">${safeItemsList}</pre>
          <h2 style="color: #D4699A;">Total: RD$${order.total.toLocaleString("es-DO")}</h2>
          <a href="https://www.skaileashop.com/admin/dashboard/pedidos"
             style="background: #2952CC; color: white; padding: 12px 24px;
             border-radius: 8px; text-decoration: none; display: inline-block;">
            Ver pedido en el admin →
          </a>
        </div>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
