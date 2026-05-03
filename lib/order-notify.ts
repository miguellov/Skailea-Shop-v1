import type { DeliveryType } from "@/lib/types"

/** Cuerpo esperado por POST /api/notify-order (externo o legado). */
export type NotifyOrderPayload = {
  customer_name: string
  /** Texto tal como lo escribió el cliente (email legible) */
  customer_phone_display: string
  delivery_type: DeliveryType
  /** Dirección multilínea si envío; null si retiro en tienda */
  delivery_address: string | null
  /** Instrucciones especiales del cliente (opcional) */
  delivery_notes?: string | null
  items: Array<{
    name: string
    quantity: number
    unit_price: number
    line_total: number
  }>
  total: number
  /** Notas internas (ej. precio por mayor) */
  notes?: string | null
}
