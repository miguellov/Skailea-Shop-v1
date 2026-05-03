import { NextResponse } from "next/server"
import { sendOrderNotification } from "@/lib/email"
import type { NotifyOrderPayload } from "@/lib/order-notify"
import type { DeliveryType } from "@/lib/types"

export const runtime = "nodejs"

function isPayload(v: unknown): v is NotifyOrderPayload {
  if (!v || typeof v !== "object") return false
  const o = v as Record<string, unknown>
  if (typeof o.customer_name !== "string") return false
  if (typeof o.customer_phone_display !== "string") return false
  const dtype = o.delivery_type as DeliveryType | undefined
  if (dtype !== "envio" && dtype !== "retiro") return false
  const addr = o.delivery_address
  if (dtype === "envio") {
    if (typeof addr !== "string" || !addr.trim()) return false
  } else if (addr != null && typeof addr !== "string") return false
  if (!Array.isArray(o.items)) return false
  if (typeof o.total !== "number") return false
  for (const it of o.items) {
    if (!it || typeof it !== "object") return false
    const row = it as Record<string, unknown>
    if (typeof row.name !== "string") return false
    if (typeof row.quantity !== "number") return false
    if (typeof row.unit_price !== "number") return false
    if (typeof row.line_total !== "number") return false
  }
  return true
}

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json()
    if (!isPayload(json)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }
    await sendOrderNotification({
      customer_name: json.customer_name,
      customer_phone: json.customer_phone_display,
      items: json.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      total: json.total,
      delivery_type: json.delivery_type,
      delivery_address:
        json.delivery_type === "envio"
          ? json.delivery_address?.trim() || undefined
          : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar email"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
