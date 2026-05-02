"use server"

import { createServiceRoleClient } from "@/lib/supabase-server"
import { triggerOrderNotificationFetch } from "@/lib/order-notify"
import type {
  Order,
  OrderLineItem,
  OrderStatus,
} from "@/lib/types"

export type SubmitStoreOrderInput = {
  customer_name: string
  customer_phone: string
  items: OrderLineItem[]
  total: number
  notes?: string | null
}

export type DashboardOrderStats = {
  newOrdersToday: number
  soldTodayDop: number
  pendingDispatch: number
}

function mapOrderRow(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    customer_name: String(row.customer_name),
    customer_phone: String(row.customer_phone),
    items: (row.items as OrderLineItem[]) ?? [],
    total: Number(row.total),
    status: row.status as OrderStatus,
    notes: row.notes == null ? null : String(row.notes),
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

/** Pedido desde la tienda pública (WhatsApp). */
export async function submitStoreOrder(
  input: SubmitStoreOrderInput
): Promise<void> {
  const sb = createServiceRoleClient()
  const name = input.customer_name.trim()
  const phone = input.customer_phone.replace(/\D/g, "")
  if (!name || !phone) {
    throw new Error("Nombre y teléfono son obligatorios")
  }
  if (!input.items.length) {
    throw new Error("El pedido no tiene artículos")
  }

  const { error } = await sb.from("orders").insert({
    customer_name: name,
    customer_phone: phone,
    items: input.items,
    total: input.total,
    status: "nuevo",
    notes: input.notes ?? null,
  })

  if (error) throw new Error(error.message)

  try {
    await triggerOrderNotificationFetch({
      customer_name: name,
      customer_phone_display: input.customer_phone.trim(),
      items: input.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
      })),
      total: input.total,
      notes: input.notes ?? null,
    })
  } catch {
    /* el fetch interno ya es tolerante; capa extra por si cambia la impl. */
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

export async function createOrder(input: {
  customer_name: string
  customer_phone: string
  lines: { product_id: string; quantity: number }[]
  notes: string | null
}): Promise<void> {
  const sb = createServiceRoleClient()
  if (!input.lines.length) throw new Error("Sin líneas")

  const ids = Array.from(new Set(input.lines.map((l) => l.product_id)))
  const { data: products, error: pe } = await sb
    .from("products")
    .select("id, name, price")
    .in("id", ids)
  if (pe) throw new Error(pe.message)
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

  const { error } = await sb.from("orders").insert({
    customer_name: input.customer_name.trim(),
    customer_phone: phone,
    items,
    total,
    status: "nuevo",
    notes: input.notes,
  })
  if (error) throw new Error(error.message)

  try {
    await triggerOrderNotificationFetch({
      customer_name: input.customer_name.trim(),
      customer_phone_display: input.customer_phone.trim(),
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
      })),
      total,
      notes: input.notes,
    })
  } catch {
    /* no bloquear pedido manual */
  }
}
