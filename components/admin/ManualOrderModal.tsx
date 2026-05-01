"use client"

import { useMemo, useState } from "react"
import { createOrder } from "@/app/admin/order-actions"
import type { Product } from "@/lib/types"
import { formatPriceDOP, formatRdCartMoney } from "@/lib/utils"

type Line = { product_id: string; quantity: number }

type Props = {
  open: boolean
  onClose: () => void
  products: Product[]
  onSaved: () => void
}

export function ManualOrderModal({ open, onClose, products, onSaved }: Props) {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<Line[]>([])
  const [pickId, setPickId] = useState("")
  const [pickQty, setPickQty] = useState(1)
  const [saving, setSaving] = useState(false)

  const activeProducts = useMemo(
    () => [...products].filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  )

  const byId = useMemo(
    () => new Map(activeProducts.map((p) => [p.id, p])),
    [activeProducts]
  )

  const total = useMemo(() => {
    return lines.reduce((s, l) => {
      const p = byId.get(l.product_id)
      if (!p) return s
      return s + p.price * l.quantity
    }, 0)
  }, [lines, byId])

  if (!open) return null

  function addLine() {
    if (!pickId) return
    const q = Math.max(1, Math.floor(pickQty))
    setLines((prev) => {
      const idx = prev.findIndex((x) => x.product_id === pickId)
      if (idx === -1) return [...prev, { product_id: pickId, quantity: q }]
      const next = [...prev]
      next[idx] = { ...next[idx], quantity: next[idx].quantity + q }
      return next
    })
    setPickQty(1)
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.product_id !== productId))
  }

  function setLineQty(productId: string, quantity: number) {
    const p = byId.get(productId)
    const max = p ? p.stock : 9999
    const q = Math.min(max, Math.max(1, Math.floor(quantity)))
    setLines((prev) =>
      prev.map((l) => (l.product_id === productId ? { ...l, quantity: q } : l))
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim()) return
    if (lines.length === 0) {
      window.alert("Añade al menos un producto")
      return
    }
    setSaving(true)
    try {
      await createOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        lines,
        notes: notes.trim() || null,
      })
      setCustomerName("")
      setCustomerPhone("")
      setNotes("")
      setLines([])
      onSaved()
      onClose()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/50 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-skailea-blush/40 bg-skailea-cream p-4 shadow-xl sm:rounded-3xl sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="font-serif text-xl font-bold text-skailea-deep">Nuevo pedido manual</h2>
        <form onSubmit={(e) => void handleSave(e)} className="mt-4 flex flex-col gap-3">
          <label className="block text-sm font-medium text-skailea-deep">
            Cliente
            <input
              required
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-skailea-deep">
            Teléfono
            <input
              required
              type="tel"
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-skailea-deep">
            Notas
            <textarea
              rows={2}
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="rounded-xl border border-skailea-blush/50 bg-skailea-blush/15 p-3">
            <p className="text-sm font-medium text-skailea-deep">Productos</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block min-w-0 flex-1 text-xs font-medium text-skailea-deep">
                Catálogo
                <select
                  className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-sm text-skailea-deep"
                  value={pickId}
                  onChange={(e) => setPickId(e.target.value)}
                >
                  <option value="">Elegir…</option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPriceDOP(p.price)} (stock {p.stock})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block w-full text-xs font-medium text-skailea-deep sm:w-24">
                Cant.
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep"
                  value={pickQty}
                  onChange={(e) => setPickQty(parseInt(e.target.value, 10) || 1)}
                />
              </label>
              <button
                type="button"
                onClick={addLine}
                className="rounded-full bg-skailea-deep px-4 py-2 text-sm font-semibold text-skailea-cream hover:opacity-95"
              >
                Añadir
              </button>
            </div>
            {lines.length > 0 && (
              <ul className="mt-3 divide-y divide-skailea-blush/40 rounded-lg border border-skailea-blush/40 bg-white">
                {lines.map((l) => {
                  const p = byId.get(l.product_id)
                  if (!p) return null
                  return (
                    <li
                      key={l.product_id}
                      className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 font-medium text-skailea-deep">
                        {p.name}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={p.stock}
                        className="w-16 rounded-lg border border-skailea-blush/50 px-2 py-1 text-center"
                        value={l.quantity}
                        onChange={(e) =>
                          setLineQty(l.product_id, parseInt(e.target.value, 10) || 1)
                        }
                      />
                      <span className="text-skailea-rose">
                        {formatRdCartMoney(p.price * l.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(l.product_id)}
                        className="text-xs text-skailea-rose hover:underline"
                      >
                        Quitar
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-3 text-right font-serif text-lg font-bold text-skailea-deep">
              Total {formatRdCartMoney(total)}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-skailea-deep/20 px-5 py-2.5 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/30 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-skailea-rose px-5 py-2.5 text-sm font-semibold text-skailea-cream hover:brightness-105 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
