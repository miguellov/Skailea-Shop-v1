"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  exportOrdersCsvAction,
  getReportData,
  type ReportPayload,
  type ReportPeriod,
} from "@/app/admin/report-actions"
import type { OrderStatus } from "@/lib/types"
import { formatRdCartMoney } from "@/lib/utils"

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
  { id: "year", label: "Este año" },
]

function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "nuevo":
      return "bg-skailea-rose/25 text-skailea-deep border-skailea-rose/40"
    case "preparando":
      return "bg-skailea-gold/30 text-skailea-deep border-skailea-gold/50"
    case "despachado":
      return "bg-skailea-blush/50 text-skailea-deep border-skailea-blush/60"
    case "cancelado":
      return "border-amber-700/35 bg-amber-100 text-amber-950"
    default:
      return "bg-skailea-deep/10 text-skailea-deep border-skailea-deep/20"
  }
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "nuevo":
      return "Nuevo"
    case "preparando":
      return "Preparando"
    case "despachado":
      return "Despachado"
    case "entregado":
      return "Entregado"
    case "cancelado":
      return "Cancelado"
    default:
      return status
  }
}

type Props = { initial: ReportPayload }

export function ReportsDashboard({ initial }: Props) {
  const [data, setData] = useState<ReportPayload>(initial)
  const [period, setPeriod] = useState<ReportPeriod>(initial.period)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const onPeriod = useCallback(async (p: ReportPeriod) => {
    if (p === period) return
    setLoading(true)
    try {
      const next = await getReportData(p)
      setData(next)
      setPeriod(p)
    } finally {
      setLoading(false)
    }
  }, [period])

  const maxTopUnits = useMemo(
    () => data.top5Products[0]?.units ?? 1,
    [data.top5Products]
  )

  async function onExportCsv() {
    setExporting(true)
    try {
      const csv = await exportOrdersCsvAction(period)
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pedidos-${period}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const m = data.metrics

  return (
    <div className={`space-y-8 ${loading ? "opacity-75" : ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-skailea-deep sm:text-3xl">
            Ventas y reportes
          </h1>
          <p className="mt-1 text-sm text-skailea-deep/70">
            Período: {data.periodBoundsLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={loading}
              onClick={() => void onPeriod(p.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                period === p.id
                  ? "bg-skailea-deep text-skailea-cream"
                  : "border border-skailea-blush/60 bg-white/80 text-skailea-deep hover:border-skailea-rose/50"
              } ${loading ? "opacity-60" : ""}`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            disabled={exporting || loading}
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 rounded-full border border-skailea-gold/60 bg-skailea-gold/15 px-3 py-1.5 text-sm font-semibold text-skailea-deep hover:bg-skailea-gold/25 disabled:opacity-50"
          >
            📥 Exportar CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-skailea-deep/55">
            Total vendido
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-skailea-deep">
            {formatRdCartMoney(m.totalSoldRd)}
          </p>
          <p className="mt-1 text-xs text-skailea-deep/60">
            Pedidos con venta (≠ nuevo)
          </p>
        </article>
        <article className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-skailea-deep/55">
            Pedidos en período
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-skailea-deep">
            {m.ordersTotal}
          </p>
          <p className="mt-1 text-xs text-skailea-deep/60">
            Incluye todos los estados
          </p>
        </article>
        <article className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-skailea-deep/55">
            Ventas confirmadas
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-skailea-deep">
            {m.salesOrdersCount}
          </p>
          <p className="mt-1 text-xs text-skailea-deep/60">
            Pedidos fuera de «nuevo»
          </p>
        </article>
        <article className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-skailea-deep/55">
            Ticket promedio
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-skailea-deep">
            {formatRdCartMoney(m.avgTicketRd)}
          </p>
          <p className="mt-1 text-xs text-skailea-deep/60">
            Total ÷ ventas confirmadas
          </p>
        </article>
        <article className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-skailea-deep/55">
            Producto más vendido
          </p>
          <p className="mt-1 line-clamp-2 font-serif text-lg font-semibold text-skailea-deep">
            {m.topProduct?.name ?? "—"}
          </p>
          <p className="mt-1 text-xs text-skailea-deep/60">
            {m.topProduct
              ? `${m.topProduct.units} u. · ${formatRdCartMoney(m.topProduct.revenue)}`
              : "Sin ventas en el período"}
          </p>
        </article>
        <article className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-skailea-deep/55">
            Unidades vendidas
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-skailea-deep">
            {m.unitsSold}
          </p>
          <p className="mt-1 text-xs text-skailea-deep/60">
            Suma de cantidades (ventas)
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm sm:p-6">
        <h2 className="font-serif text-lg font-semibold text-skailea-deep">
          Ventas últimos 7 días
        </h2>
        <p className="mt-0.5 text-xs text-skailea-deep/65">
          Total por día (pedidos ≠ nuevo), zona horaria Santo Domingo
        </p>
        <div className="mt-4 h-64 w-full min-h-[16rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chart7d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--blush)" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--deep)", fontSize: 11 }}
                axisLine={{ stroke: "var(--blush)" }}
              />
              <YAxis
                tick={{ fill: "var(--deep)", fontSize: 11 }}
                axisLine={{ stroke: "var(--blush)" }}
                tickFormatter={(v) =>
                  typeof v === "number" && v >= 1000
                    ? `${Math.round(v / 1000)}k`
                    : String(v)
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatRdCartMoney(Number(value ?? 0)),
                  "Ventas",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "var(--blush)",
                  fontSize: 13,
                }}
              />
              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
                fill="var(--rose)"
                activeBar={{ fill: "var(--gold)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-lg font-semibold text-skailea-deep">
              Pedidos recientes
            </h2>
            <Link
              href="/admin/dashboard/pedidos"
              className="text-sm font-semibold text-skailea-rose hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <p className="mt-0.5 text-xs text-skailea-deep/65">
            Últimos 10 del período seleccionado
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-skailea-blush/50 text-xs uppercase tracking-wide text-skailea-deep/55">
                  <th className="pb-2 pr-2 font-medium">Fecha</th>
                  <th className="pb-2 pr-2 font-medium">Cliente</th>
                  <th className="pb-2 pr-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-skailea-deep/60">
                      No hay pedidos en este período.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-skailea-blush/30 last:border-0"
                    >
                      <td className="py-2.5 pr-2 align-top text-skailea-deep/85">
                        {new Date(o.created_at).toLocaleString("es-DO", {
                          timeZone: "America/Santo_Domingo",
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-2.5 pr-2 align-top font-medium text-skailea-deep">
                        {o.customer_name || "—"}
                      </td>
                      <td className="py-2.5 pr-2 align-top tabular-nums">
                        {formatRdCartMoney(o.total)}
                      </td>
                      <td className="py-2.5 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(o.status)}`}
                        >
                          {statusLabel(o.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-skailea-blush/40 bg-white/90 p-4 shadow-sm sm:p-5">
          <h2 className="font-serif text-lg font-semibold text-skailea-deep">
            Top 5 productos (período)
          </h2>
          <p className="mt-0.5 text-xs text-skailea-deep/65">
            Por unidades vendidas; barra relativa al #1
          </p>
          <ul className="mt-4 space-y-4">
            {data.top5Products.length === 0 ? (
              <li className="text-sm text-skailea-deep/60">Sin datos en el período.</li>
            ) : (
              data.top5Products.map((p, i) => {
                const pct = Math.max(8, Math.round((p.units / maxTopUnits) * 100))
                return (
                  <li key={`${p.name}-${i}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="line-clamp-2 font-medium text-skailea-deep">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-skailea-deep/70">
                        {p.units} u. · {formatRdCartMoney(p.revenue)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-skailea-blush/35">
                      <div
                        className="h-full rounded-full bg-skailea-rose transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
