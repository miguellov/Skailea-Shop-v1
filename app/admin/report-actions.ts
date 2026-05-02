"use server"

import { createServiceRoleClient } from "@/lib/supabase-server"
import {
  getChartSevenDays,
  getPeriodBounds,
  type ReportPeriod,
} from "@/lib/report-ranges"

export type { ReportPeriod } from "@/lib/report-ranges"
import type {
  DeliveryType,
  Order,
  OrderLineItem,
  OrderStatus,
  PaymentMethod,
} from "@/lib/types"

const ORDER_STATUSES: OrderStatus[] = [
  "nuevo",
  "preparando",
  "despachado",
  "entregado",
]

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
    delivery_type: parseDeliveryType(row.delivery_type),
    delivery_address:
      row.delivery_address == null ? null : String(row.delivery_address),
    delivery_notes:
      row.delivery_notes == null ? null : String(row.delivery_notes),
    items,
    total: Number(row.total ?? 0),
    status,
    notes: row.notes == null ? null : String(row.notes),
    paid: row.paid === true,
    payment_method: parsePaymentMethod(row.payment_method),
    paid_at: row.paid_at == null ? null : String(row.paid_at),
    invoice_number:
      row.invoice_number == null || String(row.invoice_number).trim() === ""
        ? null
        : String(row.invoice_number),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export type ReportTopProduct = { name: string; units: number; revenue: number }

export type ReportRecentOrder = {
  id: string
  created_at: string
  customer_name: string
  total: number
  status: OrderStatus
}

export type ReportChartDay = { label: string; total: number; ymd: string }

export type ReportPayload = {
  period: ReportPeriod
  periodBoundsLabel: string
  metrics: {
    totalSoldRd: number
    ordersTotal: number
    salesOrdersCount: number
    avgTicketRd: number
    topProduct: ReportTopProduct | null
    unitsSold: number
  }
  chart7d: ReportChartDay[]
  recentOrders: ReportRecentOrder[]
  top5Products: ReportTopProduct[]
}

function aggregateTopProducts(soldOrders: Order[]): ReportTopProduct[] {
  const map = new Map<string, { units: number; revenue: number }>()
  for (const o of soldOrders) {
    for (const it of o.items) {
      const name = it.name?.trim() || "Producto"
      const prev = map.get(name) ?? { units: 0, revenue: 0 }
      map.set(name, {
        units: prev.units + it.quantity,
        revenue: prev.revenue + it.line_total,
      })
    }
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
}

export async function getReportData(period: ReportPeriod): Promise<ReportPayload> {
  const sb = createServiceRoleClient()
  const { startIso, endIso, label: periodBoundsLabel } = getPeriodBounds(period)
  const chartMeta = getChartSevenDays()
  const chartStart = chartMeta[0].startIso
  const chartEnd = chartMeta[6].endIso

  const [{ data: periodRows, error: e1 }, { data: chartRows, error: e2 }] =
    await Promise.all([
      sb
        .from("orders")
        .select("*")
        .gte("created_at", startIso)
        .lte("created_at", endIso)
        .order("created_at", { ascending: false })
        .limit(8000),
      sb
        .from("orders")
        .select("*")
        .gte("created_at", chartStart)
        .lte("created_at", chartEnd)
        .limit(8000),
    ])

  if (e1) throw new Error(e1.message)
  if (e2) throw new Error(e2.message)

  const periodOrders = (periodRows ?? []).map((r) =>
    mapOrder(r as Record<string, unknown>)
  )
  const chartOrders = (chartRows ?? []).map((r) =>
    mapOrder(r as Record<string, unknown>)
  )

  const soldInPeriod = periodOrders.filter((o) => o.status !== "nuevo")
  const totalSoldRd = soldInPeriod.reduce((s, o) => s + o.total, 0)
  const salesOrdersCount = soldInPeriod.length
  const ordersTotal = periodOrders.length
  const avgTicketRd =
    salesOrdersCount > 0 ? Math.round(totalSoldRd / salesOrdersCount) : 0

  const ranked = aggregateTopProducts(soldInPeriod)
  const top5Products = ranked.slice(0, 5)
  const topProduct = ranked[0] ?? null
  const unitsSold = soldInPeriod.reduce(
    (s, o) => s + o.items.reduce((u, it) => u + it.quantity, 0),
    0
  )

  const chart7d: ReportChartDay[] = chartMeta.map((day) => {
    let total = 0
    const s = new Date(day.startIso).getTime()
    const e = new Date(day.endIso).getTime()
    for (const o of chartOrders) {
      if (o.status === "nuevo") continue
      const t = new Date(o.created_at).getTime()
      if (t >= s && t <= e) total += o.total
    }
    return { label: day.label, total, ymd: day.ymd }
  })

  const recentOrders: ReportRecentOrder[] = periodOrders.slice(0, 10).map((o) => ({
    id: o.id,
    created_at: o.created_at,
    customer_name: o.customer_name,
    total: o.total,
    status: o.status,
  }))

  return {
    period,
    periodBoundsLabel,
    metrics: {
      totalSoldRd,
      ordersTotal,
      salesOrdersCount,
      avgTicketRd,
      topProduct,
      unitsSold,
    },
    chart7d,
    recentOrders,
    top5Products,
  }
}

function csvEscapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function orderProductsSummary(o: Order): string {
  return o.items.map((it) => `${it.quantity}x ${it.name}`).join("; ")
}

export async function exportOrdersCsvAction(period: ReportPeriod): Promise<string> {
  const sb = createServiceRoleClient()
  const { startIso, endIso } = getPeriodBounds(period)
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .gte("created_at", startIso)
    .lte("created_at", endIso)
    .order("created_at", { ascending: false })
    .limit(12000)

  if (error) throw new Error(error.message)

  const orders = (data ?? []).map((r) => mapOrder(r as Record<string, unknown>))
  const header = ["Fecha", "Cliente", "Teléfono", "Productos", "Total", "Estado"]
  const lines = [
    header.join(","),
    ...orders.map((o) => {
      const fecha = new Date(o.created_at).toLocaleString("es-DO", {
        timeZone: "America/Santo_Domingo",
        dateStyle: "short",
        timeStyle: "short",
      })
      return [
        csvEscapeCell(fecha),
        csvEscapeCell(o.customer_name),
        csvEscapeCell(o.customer_phone),
        csvEscapeCell(orderProductsSummary(o)),
        csvEscapeCell(String(o.total)),
        csvEscapeCell(o.status),
      ].join(",")
    }),
  ]
  return lines.join("\n")
}
