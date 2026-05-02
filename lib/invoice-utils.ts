import { RETIRO_LOCATION_FULL } from "@/lib/shipping-copy"
import {
  SITE_LOCATION,
  SITE_PHONE_DISPLAY,
  SITE_WHATSAPP_DIGITS_DEFAULT,
} from "@/lib/site"
import type { DeliveryType, Order, PaymentMethod } from "@/lib/types"
import { formatRdCartMoney } from "@/lib/utils"

const HEAD = "#0A1F6B"
const ACCENT = "#D4699A"

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "efectivo":
      return "Efectivo"
    case "transferencia":
      return "Transferencia"
    case "tarjeta":
      return "Tarjeta"
    default:
      return String(method)
  }
}

/** WhatsApp / teléfono guardado en pedido (solo dígitos) → texto legible */
export function formatInvoicePhoneDisplay(stored: string): string {
  const d = stored.replace(/\D/g, "")
  if (d.length === 11 && d.startsWith("1")) {
    const r = d.slice(1)
    return `+1 ${r.slice(0, 3)} ${r.slice(3, 6)}-${r.slice(6)}`
  }
  if (d.length === 10) {
    return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`
  }
  return stored.trim() || "—"
}

export function deliverySummaryInvoice(params: {
  delivery_type: DeliveryType
  delivery_address: string | null
}): { lineEntrega: string; lineDireccion: string } {
  if (params.delivery_type === "retiro") {
    return {
      lineEntrega: "Retiro en tienda",
      lineDireccion: RETIRO_LOCATION_FULL,
    }
  }
  const addr = params.delivery_address?.trim() || "—"
  return {
    lineEntrega: "Envío a domicilio",
    lineDireccion: addr.replace(/\n/g, ", "),
  }
}

export function formatInvoiceDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function invoiceMoneyLines(totalRd: number): {
  subtotal: string
  envio: string
  total: string
} {
  const t = formatRdCartMoney(totalRd)
  return {
    subtotal: t,
    envio: "A confirmar",
    total: t,
  }
}

export const INVOICE_THEME = { head: HEAD, accent: ACCENT } as const

/** Teléfono tienda en pie de factura (formato corto RD) */
export function formatInvoiceBusinessPhone(): string {
  const d = SITE_WHATSAPP_DIGITS_DEFAULT.replace(/\D/g, "")
  if (d.length >= 11 && d.startsWith("1")) {
    const r = d.slice(-10)
    return `${r.slice(0, 3)}-${r.slice(3, 6)}-${r.slice(6)}`
  }
  return SITE_PHONE_DISPLAY.replace(/[^\d+()\s-]/g, "").trim() || SITE_PHONE_DISPLAY
}

export function invoiceFooterLocationShort(): string {
  return SITE_LOCATION.replace(", República Dominicana", ", RD")
}

/** Pedido pagado con datos mínimos para la factura visual */
export type InvoiceOrderInput = Pick<
  Order,
  | "customer_name"
  | "customer_phone"
  | "delivery_type"
  | "delivery_address"
  | "items"
  | "total"
  | "paid"
  | "payment_method"
  | "paid_at"
  | "created_at"
  | "invoice_number"
>
