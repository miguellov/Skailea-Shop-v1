"use client"

import Link from "next/link"
import { StatsCards } from "@/components/admin/StatsCards"
import { useAdminProducts } from "@/components/admin/AdminProductsContext"
import type { DashboardOrderStats } from "@/app/admin/order-actions"
import { formatPriceDOP } from "@/lib/utils"

export function DashboardHome({ orderStats }: { orderStats: DashboardOrderStats }) {
  const { stats, categories } = useAdminProducts()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-skailea-deep sm:text-3xl">
          Resumen
        </h1>
        <p className="mt-1 text-sm text-skailea-charcoal/80">
          Vista rápida de pedidos e inventario.
        </p>
      </div>

      <StatsCards
        total={stats.total}
        agotados={stats.agotados}
        stockBajo={stats.stockBajo}
        orderStats={orderStats}
      />

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-semibold text-skailea-deep">Poco stock (&lt;5 uds.)</h2>
          <Link
            href="/admin/dashboard/productos"
            className="text-sm font-medium text-skailea-rose underline-offset-2 hover:underline"
          >
            Gestionar productos →
          </Link>
        </div>
        {stats.lowStockProducts.length === 0 ? (
          <p className="rounded-2xl border border-skailea-blush/40 bg-skailea-blush/20 px-4 py-6 text-center text-sm text-skailea-deep/80">
            No hay productos con stock bajo (entre 1 y 4 unidades).
          </p>
        ) : (
          <ul className="divide-y divide-skailea-blush/40 overflow-hidden rounded-2xl border border-skailea-blush/40 bg-white">
            {stats.lowStockProducts.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-skailea-deep">{p.name}</p>
                  <p className="text-xs text-skailea-rose">
                    {categories.find((c) => c.id === p.category_id)?.name ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-skailea-deep">
                    {formatPriceDOP(p.price)}
                  </p>
                  <p className="text-xs text-skailea-charcoal/75">
                    Stock:{" "}
                    <span className="font-semibold text-skailea-rose">{p.stock}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
