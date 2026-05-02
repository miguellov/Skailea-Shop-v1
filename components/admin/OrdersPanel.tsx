"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  advanceOrderStatus,
  deleteOrder,
  updateOrderNotes,
} from "@/app/admin/order-actions"
import { ManualOrderModal } from "@/components/admin/ManualOrderModal"
import { OrderDetailModal } from "@/components/admin/OrderDetailModal"
import { useAdminProducts } from "@/components/admin/AdminProductsContext"
import { getOrderStatusNotifyMessage } from "@/lib/order-notify-messages"
import type { Order, OrderStatus } from "@/lib/types"
import {
  formatPriceDOP,
  normalizePhoneForWhatsAppRD,
  whatsappUrl,
} from "@/lib/utils"

const TABS: { key: OrderStatus | "todos"; label: string }[] = [
  { key: "nuevo", label: "Nuevos" },
  { key: "preparando", label: "Preparando" },
  { key: "despachado", label: "Despachados" },
  { key: "entregado", label: "Entregados" },
  { key: "todos", label: "Todos" },
]

function nextActionLabel(status: OrderStatus): string | null {
  switch (status) {
    case "nuevo":
      return "→ Preparando"
    case "preparando":
      return "→ Despachado"
    case "despachado":
      return "→ Entregado"
    default:
      return null
  }
}

function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "nuevo":
      return "bg-skailea-rose/25 text-skailea-deep border-skailea-rose/40"
    case "preparando":
      return "bg-skailea-gold/30 text-skailea-deep border-skailea-gold/50"
    case "despachado":
      return "bg-skailea-blush/50 text-skailea-deep border-skailea-blush/60"
    default:
      return "bg-skailea-deep/10 text-skailea-deep border-skailea-deep/20"
  }
}

type Props = {
  initialOrders: Order[]
}

export function OrdersPanel({ initialOrders }: Props) {
  const router = useRouter()
  const { products } = useAdminProducts()
  const [tab, setTab] = useState<OrderStatus | "todos">("nuevo")
  const [manualOpen, setManualOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)

  const filtered = useMemo(() => {
    if (tab === "todos") return initialOrders
    return initialOrders.filter((o) => o.status === tab)
  }, [initialOrders, tab])

  async function onAdvance(o: Order) {
    try {
      await advanceOrderStatus(o.id, o.status)
      router.refresh()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    }
  }

  async function onSaveNotes(id: string, value: string) {
    try {
      await updateOrderNotes(id, value)
      router.refresh()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("¿Eliminar este pedido?")) return
    try {
      await deleteOrder(id)
      router.refresh()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    }
  }

  function customerNotifyHref(o: Order): string | null {
    const n = normalizePhoneForWhatsAppRD(o.customer_phone).replace(/\D/g, "")
    if (n.length < 11) return null
    const msg = getOrderStatusNotifyMessage(o)
    const href = whatsappUrl(n, msg)
    return href === "#" ? null : href
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-skailea-deep sm:text-3xl">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-skailea-charcoal/80">
            Gestiona pedidos de la tienda y registra ventas manuales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="rounded-full bg-skailea-deep px-5 py-2.5 text-sm font-semibold text-skailea-cream hover:opacity-95"
        >
          ➕ Nuevo pedido
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const active = tab === t.key
          const count =
            t.key === "todos"
              ? initialOrders.length
              : initialOrders.filter((o) => o.status === t.key).length
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                active
                  ? "bg-skailea-rose text-skailea-cream shadow-sm"
                  : "border border-skailea-blush/50 bg-white text-skailea-deep hover:bg-skailea-blush/30"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-skailea-cream/25" : "bg-skailea-blush/40"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-skailea-blush/60 bg-skailea-blush/15 px-4 py-10 text-center text-sm text-skailea-deep/80">
          No hay pedidos en esta vista.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((o) => {
            const notifyHref = customerNotifyHref(o)
            const nextLabel = nextActionLabel(o.status)

            return (
              <li
                key={o.id}
                className="rounded-2xl border border-skailea-blush/45 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-skailea-deep">{o.customer_name}</p>
                    <p className="text-sm text-skailea-rose">{o.customer_phone}</p>
                    {o.delivery_address && (
                      <p className="mt-2 max-w-md whitespace-pre-wrap text-sm leading-snug text-skailea-deep">
                        📍 {o.delivery_address}
                      </p>
                    )}
                    {o.delivery_notes && (
                      <p className="mt-1 text-xs text-skailea-charcoal/80">
                        📝 {o.delivery_notes}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-skailea-charcoal/70">
                      {new Date(o.created_at).toLocaleString("es-DO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(o.status)}`}
                  >
                    {o.status}
                  </span>
                </div>

                <ul className="mt-3 space-y-1.5 border-t border-skailea-blush/30 pt-3 text-sm">
                  {o.items.map((it, i) => (
                    <li
                      key={`${o.id}-${it.product_id}-${i}`}
                      className="flex justify-between gap-2 text-skailea-deep"
                    >
                      <span>
                        {it.quantity}× {it.name}
                      </span>
                      <span className="shrink-0 text-skailea-rose">
                        {formatPriceDOP(it.line_total)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right font-serif text-lg font-bold text-skailea-deep">
                  Total {formatPriceDOP(o.total)}
                </p>

                <label className="mt-3 block text-xs font-medium text-skailea-deep">
                  Notas
                  <textarea
                    key={`${o.id}-${o.updated_at}`}
                    rows={2}
                    defaultValue={o.notes ?? ""}
                    className="mt-1 w-full rounded-xl border border-skailea-blush/50 bg-skailea-cream/50 px-3 py-2 text-sm text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/50"
                    onBlur={(e) => {
                      const v = e.target.value
                      if (v !== (o.notes ?? "")) void onSaveNotes(o.id, v)
                    }}
                    placeholder="Notas internas…"
                  />
                </label>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {nextLabel && (
                    <button
                      type="button"
                      onClick={() => void onAdvance(o)}
                      className="rounded-full bg-skailea-gold/40 px-4 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-gold/55 sm:text-sm"
                    >
                      {nextLabel}
                    </button>
                  )}
                  {notifyHref ? (
                    <a
                      href={notifyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:brightness-110 sm:text-sm"
                    >
                      💬 Notificar cliente
                    </a>
                  ) : (
                    <span
                      className="inline-flex cursor-not-allowed items-center rounded-full border border-dashed border-skailea-blush/60 px-4 py-2 text-xs text-skailea-charcoal/50 sm:text-sm"
                      title="Revisa el teléfono del cliente (incluye código de país o 10 dígitos RD)"
                    >
                      💬 Notificar cliente
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailOrder(o)}
                    className="rounded-full border border-skailea-deep/20 bg-white px-4 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-blush/30 sm:text-sm"
                  >
                    📋 Ver pedido completo
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(o.id)}
                    className="rounded-full border border-skailea-rose/40 px-4 py-2 text-xs font-semibold text-skailea-rose hover:bg-skailea-rose/10 sm:text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ManualOrderModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        products={products}
        onSaved={() => router.refresh()}
      />

      <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
    </div>
  )
}
