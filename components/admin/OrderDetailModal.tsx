"use client"

import { useEffect } from "react"
import type { Order, OrderStatus } from "@/lib/types"
import { formatPriceDOP } from "@/lib/utils"

const STATUS_FLOW: OrderStatus[] = [
  "nuevo",
  "preparando",
  "despachado",
  "entregado",
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  preparando: "Preparando",
  despachado: "Despachado",
  entregado: "Entregado",
}

type Props = {
  order: Order | null
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: Props) {
  useEffect(() => {
    if (!order) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [order, onClose])

  if (!order) return null

  const currentIdx = STATUS_FLOW.indexOf(order.status)

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/50 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-skailea-blush/40 bg-skailea-cream shadow-xl sm:max-h-[90vh] sm:rounded-3xl">
        <header className="flex shrink-0 items-center justify-between border-b border-skailea-blush/40 px-4 py-4 sm:px-5">
          <h2
            id="order-detail-title"
            className="font-serif text-lg font-semibold text-skailea-deep sm:text-xl"
          >
            📋 Pedido completo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-skailea-deep hover:bg-skailea-blush/40"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="rounded-xl border border-skailea-blush/40 bg-white p-3">
            <p className="font-semibold text-skailea-deep">{order.customer_name}</p>
            <p className="text-sm text-skailea-rose">{order.customer_phone}</p>
            {order.delivery_address && (
              <div className="mt-3 rounded-lg border border-skailea-gold/35 bg-skailea-cream/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-skailea-gold">
                  Dirección de envío
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-skailea-deep">
                  📍 {order.delivery_address}
                </p>
              </div>
            )}
            {order.delivery_notes && (
              <p className="mt-2 text-sm text-skailea-charcoal/85">
                <span className="font-semibold text-skailea-deep">
                  Instrucciones del cliente:{" "}
                </span>
                {order.delivery_notes}
              </p>
            )}
            <p className="mt-2 text-xs text-skailea-charcoal/75">
              Creado:{" "}
              {new Date(order.created_at).toLocaleString("es-DO", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            <p className="text-xs text-skailea-charcoal/75">
              Última actualización:{" "}
              {new Date(order.updated_at).toLocaleString("es-DO", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-skailea-gold">
            Productos
          </h3>
          <ul className="mt-2 divide-y divide-skailea-blush/35 overflow-hidden rounded-xl border border-skailea-blush/40 bg-white">
            {order.items.map((it, i) => (
              <li
                key={`${order.id}-d-${it.product_id}-${i}`}
                className="flex justify-between gap-3 px-3 py-2.5 text-sm"
              >
                <span className="text-skailea-deep">
                  {it.quantity}× {it.name}
                </span>
                <span className="shrink-0 font-medium text-skailea-rose">
                  {formatPriceDOP(it.line_total)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right font-serif text-xl font-bold text-skailea-deep">
            Total {formatPriceDOP(order.total)}
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-skailea-gold">
            Historial de estados
          </h3>
          <p className="mt-1 text-[11px] text-skailea-charcoal/70">
            Progreso según el estado actual del pedido (las fechas por etapa se registran cuando
            avanzas el estado en el panel).
          </p>
          <ol className="mt-3 space-y-0 border-l-2 border-skailea-blush/50 pl-4">
            {STATUS_FLOW.map((st, i) => {
              const done = i < currentIdx
              const current = i === currentIdx
              const pending = i > currentIdx
              return (
                <li key={st} className="relative pb-4 last:pb-0">
                  <span
                    className={`absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                      done || current
                        ? "border-skailea-gold bg-skailea-gold"
                        : "border-skailea-blush/60 bg-skailea-cream"
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      current ? "text-skailea-deep" : done ? "text-skailea-deep/80" : "text-skailea-charcoal/50"
                    }`}
                  >
                    {STATUS_LABEL[st]}
                    {current && (
                      <span className="ml-2 rounded-full bg-skailea-gold/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-skailea-deep">
                        Actual
                      </span>
                    )}
                    {done && !current && (
                      <span className="ml-2 text-[10px] font-medium uppercase text-skailea-gold">
                        Completado
                      </span>
                    )}
                    {pending && (
                      <span className="ml-2 text-[10px] font-medium uppercase text-skailea-charcoal/45">
                        Pendiente
                      </span>
                    )}
                  </p>
                  {current && (
                    <p className="mt-0.5 text-xs text-skailea-charcoal/65">
                      Ref. actualización:{" "}
                      {new Date(order.updated_at).toLocaleString("es-DO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                  {st === "nuevo" && i === 0 && (
                    <p className="mt-0.5 text-xs text-skailea-charcoal/60">
                      Pedido recibido:{" "}
                      {new Date(order.created_at).toLocaleString("es-DO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-skailea-gold">
            Notas internas / sistema
          </h3>
          <div className="mt-2 rounded-xl border border-skailea-blush/40 bg-white px-3 py-3 text-sm text-skailea-deep">
            {order.notes?.trim() ? order.notes : (
              <span className="text-skailea-charcoal/55">Sin notas.</span>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-skailea-blush/40 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-skailea-deep py-2.5 text-sm font-semibold text-skailea-cream hover:opacity-95"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  )
}
