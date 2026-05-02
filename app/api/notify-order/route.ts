import { NextResponse } from "next/server"
import {
  type NotifyOrderPayload,
  sendOrderNotificationEmail,
} from "@/lib/order-notify"

export const runtime = "nodejs"

function isPayload(v: unknown): v is NotifyOrderPayload {
  if (!v || typeof v !== "object") return false
  const o = v as Record<string, unknown>
  if (typeof o.customer_name !== "string") return false
  if (typeof o.customer_phone_display !== "string") return false
  if (typeof o.delivery_address !== "string") return false
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
    await sendOrderNotificationEmail(json)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar email"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
