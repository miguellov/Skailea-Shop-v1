import type { DashboardOrderStats } from "@/app/admin/order-actions"
import { formatPriceDOP } from "@/lib/utils"

type Props = {
  total: number
  agotados: number
  stockBajo: number
  orderStats: DashboardOrderStats
}

export function StatsCards({ total, agotados, stockBajo, orderStats }: Props) {
  const orderCards = [
    {
      label: "Pedidos nuevos hoy",
      value: orderStats.newOrdersToday,
      accent: "border-skailea-rose/35 bg-skailea-blush/25",
      format: "number" as const,
    },
    {
      label: "Vendido hoy (RD$)",
      value: orderStats.soldTodayDop,
      accent: "border-skailea-gold/45 bg-skailea-cream",
      format: "money" as const,
    },
    {
      label: "Pendientes de despachar",
      value: orderStats.pendingDispatch,
      accent: "border-skailea-deep/20 bg-white",
      format: "number" as const,
    },
  ]

  const productCards = [
    { label: "Total productos", value: total, accent: "border-skailea-gold/40 bg-skailea-cream" },
    { label: "Agotados", value: agotados, accent: "border-skailea-rose/35 bg-skailea-blush/30" },
    {
      label: "Stock bajo (<5)",
      value: stockBajo,
      accent: "border-skailea-deep/15 bg-skailea-cream",
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-skailea-gold">
        Pedidos
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {orderCards.map((c) => (
          <li
            key={c.label}
            className={`rounded-2xl border px-4 py-4 shadow-sm ${c.accent}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-skailea-rose">
              {c.label}
            </p>
            <p className="mt-2 font-serif text-3xl font-bold text-skailea-deep">
              {c.format === "money" ? formatPriceDOP(c.value) : c.value}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-skailea-gold">
        Inventario
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {productCards.map((c) => (
          <li
            key={c.label}
            className={`rounded-2xl border px-4 py-4 shadow-sm ${c.accent}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-skailea-rose">
              {c.label}
            </p>
            <p className="mt-2 font-serif text-3xl font-bold text-skailea-deep">{c.value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
