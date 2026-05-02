import { Resend } from "resend"
import { getInternalAppUrl } from "@/lib/internal-app-url"
import { formatPriceDOP } from "@/lib/utils"

const ADMIN_PEDIDOS_URL =
  process.env.ADMIN_ORDERS_URL?.trim() ??
  "https://skailea-shop-v1.vercel.app/admin/dashboard/pedidos"

export type NotifyOrderPayload = {
  customer_name: string
  /** Texto tal como lo escribió el cliente (email legible) */
  customer_phone_display: string
  items: Array<{
    name: string
    quantity: number
    unit_price: number
    line_total: number
  }>
  total: number
  notes?: string | null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function buildOrderNotificationHtml(payload: NotifyOrderPayload): string {
  const deep = "#0a1f6b"
  const rose = "#2952cc"
  const gold = "#e8a0b4"
  const blush = "#e8c4d0"
  const cream = "#f5f0f8"

  const rows = payload.items
    .map(
      (it) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${blush};color:${deep};font-size:14px;">
        ${escapeHtml(it.name)}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid ${blush};color:${rose};font-size:14px;text-align:center;">
        ${it.quantity}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid ${blush};color:${deep};font-size:14px;text-align:right;">
        ${formatPriceDOP(it.unit_price)}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid ${blush};color:${deep};font-size:14px;font-weight:600;text-align:right;">
        ${formatPriceDOP(it.line_total)}
      </td>
    </tr>`
    )
    .join("")

  const notesBlock =
    payload.notes && payload.notes.trim().length > 0
      ? `<p style="margin:16px 0 0;font-size:13px;color:${deep};opacity:0.88;">
          <strong>Notas:</strong> ${escapeHtml(payload.notes.trim())}
        </p>`
      : ""

  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:${cream};font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(10,31,107,0.12);">
      <tr>
        <td style="background:linear-gradient(160deg, ${deep} 0%, #061440 100%);padding:22px 24px;text-align:center;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#f5f0f8;letter-spacing:0.02em;">Skailea Shop</p>
          <p style="margin:8px 0 0;font-size:13px;color:${gold};">Nuevo pedido recibido</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 8px;font-size:15px;color:${deep};"><strong>Cliente</strong></p>
          <p style="margin:0;font-size:16px;color:${rose};font-weight:600;">${escapeHtml(payload.customer_name)}</p>
          <p style="margin:16px 0 6px;font-size:15px;color:${deep};"><strong>WhatsApp / teléfono</strong></p>
          <p style="margin:0;font-size:15px;color:${deep};">${escapeHtml(payload.customer_phone_display)}</p>
          ${notesBlock}
          <p style="margin:22px 0 10px;font-size:15px;color:${deep};"><strong>Productos</strong></p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid ${blush};">
            <thead>
              <tr style="background:${cream};">
                <th align="left" style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${deep};">Producto</th>
                <th style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${deep};">Cant.</th>
                <th align="right" style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${deep};">P. unit.</th>
                <th align="right" style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${deep};">Subtotal</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
            <tr>
              <td align="right" style="font-size:18px;font-weight:700;color:${deep};padding-top:8px;">
                Total: ${formatPriceDOP(payload.total)}
              </td>
            </tr>
          </table>
          <div style="margin-top:26px;text-align:center;">
            <a href="${ADMIN_PEDIDOS_URL}" style="display:inline-block;background:${rose};color:#f5f0f8;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">
              Ver pedido en el panel
            </a>
          </div>
          <p style="margin:20px 0 0;font-size:11px;color:#6b7280;text-align:center;">
            Enlace directo: <a href="${ADMIN_PEDIDOS_URL}" style="color:${rose};">${escapeHtml(ADMIN_PEDIDOS_URL)}</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/**
 * Envía el correo vía Resend. Si faltan variables, no hace nada (p. ej. entorno local).
 * Si Resend devuelve error, lanza (el Route Handler puede responder 500).
 */
export async function sendOrderNotificationEmail(
  payload: NotifyOrderPayload
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const to = process.env.NOTIFICATION_EMAIL?.trim()
  if (!apiKey || !to) return

  const resend = new Resend(apiKey)
  const subject = `🛍️ Nuevo pedido - ${payload.customer_name.trim()}`
  const html = buildOrderNotificationHtml(payload)

  const { error } = await resend.emails.send({
    from: "Skailea Shop <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  })

  if (error) throw new Error(error.message)
}

/**
 * Llama al Route Handler POST /api/notify-order en el mismo origen.
 * Errores de red o HTTP no se propagan (no bloquear el pedido).
 */
export async function triggerOrderNotificationFetch(
  payload: NotifyOrderPayload
): Promise<void> {
  try {
    const base = getInternalAppUrl()
    await fetch(`${base}/api/notify-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    /* sin bloquear flujo del pedido */
  }
}
