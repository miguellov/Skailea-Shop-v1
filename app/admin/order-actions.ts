"use server"

import { createServiceRoleClient } from "@/lib/supabase-server"
import { formatSupabaseError } from "@/lib/supabase-errors"
import { triggerOrderNotificationFetch } from "@/lib/order-notify"
import type {
  DeliveryType,
  Order,
  OrderLineItem,
  OrderStatus,
  PaymentMethod,
} from "@/lib/types"

export type SubmitStoreOrderInput = {
  customer_name: string
  customer_phone: string
  delivery_type: DeliveryType
  delivery_address: string | null
  delivery_notes?: string | null
  items: OrderLineItem[]
  total: number
  notes?: string | null
}

export type DashboardOrderStats = {
  newOrdersToday: number
  soldTodayDop: number
  pendingDispatch: number
}

function parseDeliveryType(raw: unknown): DeliveryType {
  const s = String(raw ?? "").trim().toLowerCase()
  return s === "retiro" ? "retiro" : "envio"
}

function parsePaymentMethod(raw: unknown): PaymentMethod | null {
  const s = String(raw ?? "").trim().toLowerCase()
  if (s === "efectivo" || s === "transferencia" || s === "tarjeta") {
    return s as PaymentMethod
  }
  return null
}

function mapOrderRow(row: Record<string, unknown>): Order {
  const rawDel = row.delivery_address
  const rawDelNotes = row.delivery_notes
  const rawInv = row.invoice_number
  return {
    id: String(row.id),
    customer_name: String(row.customer_name),
    customer_phone: String(row.customer_phone),
    delivery_type: parseDeliveryType(row.delivery_type),
    delivery_address:
      rawDel == null || String(rawDel).trim() === ""
        ? null
        : String(rawDel),
    delivery_notes:
      rawDelNotes == null || String(rawDelNotes).trim() === ""
        ? null
        : String(rawDelNotes),
    items: (row.items as OrderLineItem[]) ?? [],
    total: Number(row.total),
    status: row.status as OrderStatus,
    notes: row.notes == null ? null : String(row.notes),
    paid: row.paid === true,
    payment_method: parsePaymentMethod(row.payment_method),
    paid_at: row.paid_at == null ? null : String(row.paid_at),
    invoice_number:
      rawInv == null || String(rawInv).trim() === ""
        ? null
        : String(rawInv),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

function utcDayBounds(): { start: string; end: string } {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

/**
 * Pedido desde la tienda pública (WhatsApp).
 * Usa **service role** en esta Server Action (solo servidor): bypass RLS y mismo
 * comportamiento que pedidos manuales; evita fallos si falta anon key o RLS mal configurado.
 */
export async function submitStoreOrder(
  input: SubmitStoreOrderInput
): Promise<void> {
  console.log(
    "[submitStoreOrder] (1) Cliente: createServiceRoleClient — SERVICE ROLE (bypass RLS)"
  )
  console.log("[submitStoreOrder] (2) Input recibido:", JSON.stringify(input, null, 2))

  let sb: ReturnType<typeof createServiceRoleClient>
  try {
    sb = createServiceRoleClient()
    console.log("[submitStoreOrder] (3) Cliente Supabase instanciado OK")
  } catch (envErr) {
    const msg = formatSupabaseError(envErr)
    console.error("[submitStoreOrder] ERROR creando cliente:", msg)
    throw new Error(`Supabase (service role): ${msg}`)
  }

  const name = input.customer_name.trim()
  const phone = input.customer_phone.replace(/\D/g, "")
  if (!name || !phone) {
    console.warn("[submitStoreOrder] Validación: falta nombre o teléfono")
    throw new Error("Nombre y teléfono son obligatorios")
  }
  if (!input.items.length) {
    console.warn("[submitStoreOrder] Validación: sin ítems")
    throw new Error("El pedido no tiene artículos")
  }
  const dtype: DeliveryType =
    input.delivery_type === "retiro" ? "retiro" : "envio"
  let deliveryAddr: string | null = null
  if (dtype === "envio") {
    const trimmed = (input.delivery_address ?? "").trim()
    if (!trimmed) {
      throw new Error("La dirección de envío es obligatoria")
    }
    deliveryAddr = trimmed
  }

  const deliveryNotes =
    input.delivery_notes?.trim() ? input.delivery_notes.trim() : null

  const orderData = {
    customer_name: name,
    customer_phone: phone,
    delivery_type: dtype,
    delivery_address: deliveryAddr,
    delivery_notes: deliveryNotes,
    items: input.items,
    total: input.total,
    status: "nuevo" as const,
    notes: input.notes ?? null,
    paid: false,
    payment_method: null,
    paid_at: null,
    invoice_number: null,
  }

  console.log("[submitStoreOrder] (4) Insert payload:", JSON.stringify(orderData, null, 2))

  const { data: inserted, error } = await sb
    .from("orders")
    .insert(orderData)
    .select("id")
    .maybeSingle()

  console.log("[submitStoreOrder] (5) Resultado insert — data:", inserted, "error:", error)

  if (error) {
    const full = formatSupabaseError(error)
    console.error("[submitStoreOrder] ERROR Supabase completo:", full)
    throw new Error(`Supabase insert: ${full}`)
  }
  if (!inserted?.id) {
    console.error("[submitStoreOrder] Insert sin id devuelto:", inserted)
    throw new Error("El pedido no se guardó (sin id en respuesta)")
  }
  console.log("[submitStoreOrder] (6) OK pedido id:", inserted.id)

  try {
    await triggerOrderNotificationFetch({
      customer_name: name,
      customer_phone_display: input.customer_phone.trim(),
      delivery_type: dtype,
      delivery_address: deliveryAddr,
      delivery_notes: deliveryNotes,
      items: input.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
      })),
      total: input.total,
      notes: input.notes ?? null,
    })
  } catch (notifyErr) {
    console.warn(
      "[submitStoreOrder] Aviso: notificación email falló (pedido ya guardado):",
      formatSupabaseError(notifyErr)
    )
  }
}

export async function getOrders(): Promise<Order[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapOrderRow(r as Record<string, unknown>))
}

export async function getNewOrdersCount(): Promise<number> {
  const sb = createServiceRoleClient()
  const { count, error } = await sb
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "nuevo")
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getDashboardOrderStats(): Promise<DashboardOrderStats> {
  const sb = createServiceRoleClient()
  const { start, end } = utcDayBounds()

  const { count: newTodayCount, error: e1 } = await sb
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "nuevo")
    .gte("created_at", start)
    .lt("created_at", end)
  if (e1) throw new Error(e1.message)

  const { data: ventasHoy, error: e2 } = await sb
    .from("orders")
    .select("total")
    .gte("created_at", start)
    .lt("created_at", end)
  if (e2) throw new Error(e2.message)

  const { count: pend, error: e3 } = await sb
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["nuevo", "preparando"])
  if (e3) throw new Error(e3.message)

  const soldTodayDop = (ventasHoy ?? []).reduce(
    (s, r) => s + Number((r as { total: number }).total),
    0
  )

  return {
    newOrdersToday: newTodayCount ?? 0,
    soldTodayDop,
    pendingDispatch: pend ?? 0,
  }
}

const STATUS_CHAIN: Record<OrderStatus, OrderStatus | null> = {
  nuevo: "preparando",
  preparando: "despachado",
  despachado: "entregado",
  entregado: null,
}

export async function advanceOrderStatus(
  id: string,
  current: OrderStatus
): Promise<void> {
  const next = STATUS_CHAIN[current]
  if (!next) throw new Error("El pedido ya está entregado")
  const sb = createServiceRoleClient()
  const { error } = await sb
    .from("orders")
    .update({
      status: next,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", current)
  if (error) throw new Error(error.message)
}

export async function updateOrderNotes(id: string, notes: string): Promise<void> {
  const sb = createServiceRoleClient()
  const { error } = await sb
    .from("orders")
    .update({
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function deleteOrder(id: string): Promise<void> {
  const sb = createServiceRoleClient()
  const { error } = await sb.from("orders").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

async function allocateNextInvoiceNumber(sb: ReturnType<
  typeof createServiceRoleClient
>): Promise<string> {
  const { data, error } = await sb
    .from("orders")
    .select("invoice_number")
    .not("invoice_number", "is", null)
  if (error) throw new Error(error.message)
  let max = 0
  for (const r of data ?? []) {
    const inv = String((r as { invoice_number: string }).invoice_number ?? "")
    const m = inv.match(/^SKL-(\d+)$/i)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `SKL-${String(max + 1).padStart(4, "0")}`
}

/** Marca pago, asigna número de factura SKL-XXXX y fecha de pago */
export async function markOrderAsPaid(
  id: string,
  paymentMethod: PaymentMethod
): Promise<void> {
  const sb = createServiceRoleClient()
  const { data: existing, error: fe } = await sb
    .from("orders")
    .select("id,paid")
    .eq("id", id)
    .maybeSingle()
  if (fe) throw new Error(fe.message)
  if (!existing) throw new Error("Pedido no encontrado")
  if ((existing as { paid?: boolean }).paid === true) {
    throw new Error("Este pedido ya está marcado como pagado")
  }

  const invoiceNumber = await allocateNextInvoiceNumber(sb)
  const paidAt = new Date().toISOString()

  const { data, error } = await sb
    .from("orders")
    .update({
      paid: true,
      payment_method: paymentMethod,
      paid_at: paidAt,
      invoice_number: invoiceNumber,
      updated_at: paidAt,
    })
    .eq("id", id)
    .eq("paid", false)
    .select("id")

  if (error) throw new Error(error.message)
  if (!data?.length) {
    throw new Error("Este pedido ya está marcado como pagado")
  }
}

export async function createOrder(input: {
  customer_name: string
  customer_phone: string
  delivery_type: DeliveryType
  /** Para envío: texto guardado en Supabase (incl. provincia/ciudad). Retiro: null */
  delivery_address: string | null
  lines: { product_id: string; quantity: number }[]
  notes: string | null
}): Promise<void> {
  console.log(
    "[createOrder] (1) Cliente: createServiceRoleClient — SERVICE ROLE (bypass RLS)"
  )
  console.log("[createOrder] (2) Input:", JSON.stringify(input, null, 2))

  let sb: ReturnType<typeof createServiceRoleClient>
  try {
    sb = createServiceRoleClient()
    console.log("[createOrder] (3) Cliente Supabase instanciado OK")
  } catch (envErr) {
    const msg = formatSupabaseError(envErr)
    console.error("[createOrder] ERROR creando cliente:", msg)
    throw new Error(`Supabase (service role): ${msg}`)
  }

  if (!input.lines.length) throw new Error("Sin líneas")

  const dtype: DeliveryType =
    input.delivery_type === "retiro" ? "retiro" : "envio"
  let deliveryAddr: string | null = null
  if (dtype === "envio") {
    const trimmed = (input.delivery_address ?? "").trim()
    if (!trimmed) {
      throw new Error("La dirección es obligatoria para envío a domicilio")
    }
    deliveryAddr = trimmed
  }

  const ids = Array.from(new Set(input.lines.map((l) => l.product_id)))
  const { data: products, error: pe } = await sb
    .from("products")
    .select("id, name, price")
    .in("id", ids)
  console.log("[createOrder] (4) Productos cargados:", products?.length, "error:", pe)
  if (pe) {
    const full = formatSupabaseError(pe)
    console.error("[createOrder] ERROR select products:", full)
    throw new Error(`Supabase (products): ${full}`)
  }
  const byId = new Map(
    (products ?? []).map((p) => [
      String((p as { id: string }).id),
      p as { id: string; name: string; price: number },
    ])
  )

  const items: OrderLineItem[] = []
  for (const line of input.lines) {
    const p = byId.get(line.product_id)
    if (!p) throw new Error(`Producto no encontrado: ${line.product_id}`)
    const q = Math.max(1, Math.floor(line.quantity))
    const unit = Number(p.price)
    items.push({
      product_id: p.id,
      name: p.name,
      quantity: q,
      unit_price: unit,
      line_total: unit * q,
    })
  }

  const total = items.reduce((s, i) => s + i.line_total, 0)
  const phone = input.customer_phone.replace(/\D/g, "")

  const row = {
    customer_name: input.customer_name.trim(),
    customer_phone: phone,
    delivery_type: dtype,
    delivery_address: deliveryAddr,
    delivery_notes: null,
    items,
    total,
    status: "nuevo" as const,
    notes: input.notes,
    paid: false,
    payment_method: null,
    paid_at: null,
    invoice_number: null,
  }

  console.log("[createOrder] (5) Insert orders payload:", JSON.stringify(row, null, 2))

  const { data: inserted, error } = await sb
    .from("orders")
    .insert(row)
    .select("id")
    .maybeSingle()

  console.log("[createOrder] (6) Resultado insert — data:", inserted, "error:", error)

  if (error) {
    const full = formatSupabaseError(error)
    console.error("[createOrder] ERROR Supabase insert:", full)
    throw new Error(`Supabase insert: ${full}`)
  }
  if (!inserted?.id) {
    console.error("[createOrder] Insert sin id:", inserted)
    throw new Error("El pedido no se guardó (sin id en respuesta)")
  }
  console.log("[createOrder] (7) OK pedido id:", inserted.id)

  try {
    await triggerOrderNotificationFetch({
      customer_name: input.customer_name.trim(),
      customer_phone_display: input.customer_phone.trim(),
      delivery_type: dtype,
      delivery_address: deliveryAddr,
      delivery_notes: null,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
      })),
      total,
      notes: input.notes,
    })
  } catch (notifyErr) {
    console.warn(
      "[createOrder] Aviso: notificación email falló (pedido ya guardado):",
      formatSupabaseError(notifyErr)
    )
  }
}
