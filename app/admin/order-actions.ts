"use server"

import { revalidatePath } from "next/cache"
import { getDayStartEndSantoDomingo } from "@/lib/order-dates"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Order, OrderLineItem, OrderStatus } from "@/lib/types"

const ORDER_STATUSES: OrderStatus[] = [
  "nuevo",
  "preparando",
  "despachado",
  "entregado",
]

function mapOrder(row: Record<string, unknown>): Order {
  const itemsRaw = row.items
  let items: OrderLineItem[] = []
  if (Array.isArray(itemsRaw)) {
    items = itemsRaw.map((it) => {
      const o = it as Record<string, unknown>
      return {
        product_id: String(o.product_id ?? ""),
        name: String(o.name ?? ""),
        quantity: Number(o.quantity ?? 0),
        unit_price: Number(o.unit_price ?? 0),
        line_total: Number(o.line_total ?? 0),
      }
    })
  }
  const rawStatus = String(row.status ?? "nuevo")
  const status = ORDER_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : "nuevo"
  return {
    id: String(row.id),
    customer_name: String(row.customer_name ?? ""),
    customer_phone: String(row.customer_phone ?? ""),
    items,
    total: Number(row.total ?? 0),
    status,
    notes: row.notes == null ? null : String(row.notes),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

async function buildValidatedLines(
  sb: ReturnType<typeof createServiceRoleClient>,
  lines: { product_id: string; quantity: number }[]
): Promise<{ items: OrderLineItem[]; total: number }> {
  if (lines.length === 0) {
    throw new Error("El pedido no tiene productos")
  }
  const merged = new Map<string, number>()
  for (const line of lines) {
    const q = Math.max(1, Math.floor(line.quantity))
    merged.set(line.product_id, (merged.get(line.product_id) ?? 0) + q)
  }
  const mergedLines = Array.from(merged.entries()).map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }))
  const ids = Array.from(merged.keys())
  const { data: products, error } = await sb
    .from("products")
    .select("id, name, price, stock, active")
    .in("id", ids)

  if (error) throw new Error(error.message)
  const byId = new Map(
    (products ?? []).map((p) => [
      String((p as { id: string }).id),
      p as { id: string; name: string; price: number; stock: number; active: boolean },
    ])
  )

  const items: OrderLineItem[] = []
  let total = 0

  for (const line of mergedLines) {
    const q = line.quantity
    const p = byId.get(line.product_id)
    if (!p) throw new Error(`Producto no encontrado: ${line.product_id}`)
    if (!p.active) throw new Error(`Producto inactivo: ${p.name}`)
    if (p.stock < q) throw new Error(`Stock insuficiente para «${p.name}» (disponible: ${p.stock})`)
    const unit = Number(p.price)
    const lineTotal = Math.round(unit * q)
    total += lineTotal
    items.push({
      product_id: p.id,
      name: p.name,
      quantity: q,
      unit_price: unit,
      line_total: lineTotal,
    })
  }

  return { items, total }
}

export async function getOrders(): Promise<Order[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapOrder(r as Record<string, unknown>))
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

export type DashboardOrderStats = {
  newOrdersToday: number
  soldTodayDop: number
  pendingDispatch: number
}

export async function getDashboardOrderStats(): Promise<DashboardOrderStats> {
  const sb = createServiceRoleClient()
  const { startIso, endIso } = getDayStartEndSantoDomingo()

  const [todayOrdersRes, pendingRes, newTodayRes] = await Promise.all([
    sb
      .from("orders")
      .select("total")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    sb
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["nuevo", "preparando"]),
    sb
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "nuevo")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
  ])

  if (todayOrdersRes.error) throw new Error(todayOrdersRes.error.message)
  if (pendingRes.error) throw new Error(pendingRes.error.message)
  if (newTodayRes.error) throw new Error(newTodayRes.error.message)

  const soldTodayDop = (todayOrdersRes.data ?? []).reduce(
    (s, r) => s + Number((r as { total: number }).total ?? 0),
    0
  )

  return {
    newOrdersToday: newTodayRes.count ?? 0,
    soldTodayDop,
    pendingDispatch: pendingRes.count ?? 0,
  }
}

export async function createOrder(input: {
  customer_name: string
  customer_phone: string
  lines: { product_id: string; quantity: number }[]
  notes?: string | null
}) {
  const sb = createServiceRoleClient()
  const name = input.customer_name.trim()
  const phone = input.customer_phone.trim()
  if (!name) throw new Error("Indica el nombre del cliente")
  if (!phone) throw new Error("Indica el teléfono")

  const { items, total } = await buildValidatedLines(sb, input.lines)

  const { error } = await sb.from("orders").insert({
    customer_name: name,
    customer_phone: phone,
    items,
    total,
    status: "nuevo",
    notes: input.notes?.trim() || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/pedidos")
}

/** Checkout desde la tienda pública (misma validación que createOrder) */
export async function submitStoreOrder(input: {
  customer_name: string
  customer_phone: string
  lines: { product_id: string; quantity: number }[]
}) {
  const sb = createServiceRoleClient()
  const name = input.customer_name.trim()
  const phone = input.customer_phone.trim()
  if (!name) throw new Error("Indica tu nombre")
  if (!phone) throw new Error("Indica tu teléfono")

  const { items, total } = await buildValidatedLines(sb, input.lines)

  const { error } = await sb.from("orders").insert({
    customer_name: name,
    customer_phone: phone,
    items,
    total,
    status: "nuevo",
    notes: null,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/pedidos")
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const sb = createServiceRoleClient()
  const { error } = await sb
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/pedidos")
}

export async function advanceOrderStatus(id: string, current: OrderStatus) {
  const next: Record<OrderStatus, OrderStatus | null> = {
    nuevo: "preparando",
    preparando: "despachado",
    despachado: "entregado",
    entregado: null,
  }
  const n = next[current]
  if (!n) return
  await updateOrderStatus(id, n)
}

export async function updateOrderNotes(id: string, notes: string) {
  const sb = createServiceRoleClient()
  const { error } = await sb
    .from("orders")
    .update({ notes: notes.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/dashboard/pedidos")
}

export async function deleteOrder(id: string) {
  const sb = createServiceRoleClient()
  const { error } = await sb.from("orders").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/pedidos")
}
