import { createServiceRoleClient } from "@/lib/supabase-server"
import type { OrderLineItem } from "@/lib/types"

type Sb = ReturnType<typeof createServiceRoleClient>

/** Tras marcar pedido como despachado: descuenta stock (mín. 0) y desactiva si llega a 0. */
export async function deductStockForOrderItems(
  sb: Sb,
  items: OrderLineItem[]
): Promise<void> {
  for (const it of items) {
    const pid = String(it.product_id ?? "").trim()
    if (!pid) continue
    const qty = Math.max(0, Math.floor(Number(it.quantity) || 0))
    if (qty === 0) continue

    const { data: row, error: fe } = await sb
      .from("products")
      .select("id, stock")
      .eq("id", pid)
      .maybeSingle()
    if (fe) throw new Error(`Stock (${pid}): ${fe.message}`)
    if (!row) continue

    const prev = Math.max(0, Math.floor(Number((row as { stock: number }).stock) || 0))
    const next = Math.max(0, prev - qty)
    const active = next > 0

    const { error: ue } = await sb
      .from("products")
      .update({
        stock: next,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pid)
    if (ue) throw new Error(`Stock update (${pid}): ${ue.message}`)
  }
}

/** Al cancelar un pedido ya despachado: devuelve stock y reactiva si corresponde. */
export async function restoreStockForOrderItems(
  sb: Sb,
  items: OrderLineItem[]
): Promise<void> {
  for (const it of items) {
    const pid = String(it.product_id ?? "").trim()
    if (!pid) continue
    const qty = Math.max(0, Math.floor(Number(it.quantity) || 0))
    if (qty === 0) continue

    const { data: row, error: fe } = await sb
      .from("products")
      .select("id, stock")
      .eq("id", pid)
      .maybeSingle()
    if (fe) throw new Error(`Stock (${pid}): ${fe.message}`)
    if (!row) continue

    const prev = Math.max(0, Math.floor(Number((row as { stock: number }).stock) || 0))
    const next = prev + qty
    const active = next > 0

    const { error: ue } = await sb
      .from("products")
      .update({
        stock: next,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pid)
    if (ue) throw new Error(`Stock restore (${pid}): ${ue.message}`)
  }
}
