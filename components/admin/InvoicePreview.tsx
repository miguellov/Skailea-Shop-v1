"use client"

import { forwardRef } from "react"
import {
  SITE_INSTAGRAM_HANDLE,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site"
import {
  deliverySummaryInvoice,
  formatInvoiceBusinessPhone,
  formatInvoiceDate,
  formatInvoicePhoneDisplay,
  invoiceFooterLocationShort,
  invoiceMoneyLines,
  INVOICE_THEME,
  paymentMethodLabel,
  type InvoiceOrderInput,
} from "@/lib/invoice-utils"
import { formatRdCartMoney } from "@/lib/utils"
import html2canvas from "html2canvas"

const W = 360

const line = (hex: string) => ({
  height: 1,
  background: hex,
  margin: "10px 0",
  opacity: 0.85,
})

export const InvoicePreview = forwardRef<HTMLDivElement, { order: InvoiceOrderInput }>(
  function InvoicePreviewInner({ order }, ref) {
    const head = INVOICE_THEME.head
    const accent = INVOICE_THEME.accent
    const invNo = order.invoice_number ?? "SKL-—"
    const fechaIso = order.paid_at ?? order.created_at
    const fecha = formatInvoiceDate(fechaIso)
    const phoneClient = formatInvoicePhoneDisplay(order.customer_phone)
    const { lineEntrega, lineDireccion } = deliverySummaryInvoice({
      delivery_type: order.delivery_type,
      delivery_address: order.delivery_address,
    })
    const money = invoiceMoneyLines(order.total)
    const subtotalNum = order.items.reduce((s, i) => s + i.line_total, 0)
    const subtotalLabel = formatRdCartMoney(subtotalNum)
    const method =
      order.payment_method != null
        ? paymentMethodLabel(order.payment_method)
        : "—"

    return (
      <div
        ref={ref}
        style={{
          width: W,
          background: "#ffffff",
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: "#1a1a2e",
          boxSizing: "border-box",
          padding: 0,
          border: `2px solid ${accent}`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(10,31,107,0.12)",
        }}
      >
        <div
          style={{
            background: head,
            padding: "18px 16px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#1e3a8a",
              marginBottom: 8,
              fontSize: 22,
            }}
            aria-hidden
          >
            🔵
          </div>
          <div
            style={{
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              color: accent,
              fontSize: 12,
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>

        <div style={{ padding: "16px 18px 20px" }}>
          <div style={line(accent)} />

          <div style={{ fontSize: 13, fontWeight: 700, color: head }}>
            FACTURA {invNo}
          </div>
          <div style={{ fontSize: 12, marginTop: 4, color: "#444" }}>
            Fecha: {fecha}
          </div>

          <div style={line(accent)} />

          <div style={{ fontSize: 12, lineHeight: 1.55 }}>
            <div>
              <span style={{ color: accent, fontWeight: 600 }}>Cliente: </span>
              {order.customer_name}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: accent, fontWeight: 600 }}>WhatsApp: </span>
              {phoneClient}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: accent, fontWeight: 600 }}>Entrega: </span>
              {lineEntrega}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: accent, fontWeight: 600 }}>Dirección: </span>
              {lineDireccion}
            </div>
          </div>

          <div style={line(accent)} />

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: head,
              marginBottom: 8,
            }}
          >
            PRODUCTOS
          </div>
          {order.items.map((it, idx) => (
            <div
              key={`${it.product_id}-${idx}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              <span style={{ flex: 1 }}>
                {it.quantity}× {it.name}
              </span>
              <span style={{ fontWeight: 600, color: head }}>
                {formatRdCartMoney(it.line_total)}
              </span>
            </div>
          ))}

          <div style={line(accent)} />

          <div style={{ fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#555" }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>{subtotalLabel}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#555" }}>Envío:</span>
              <span style={{ fontStyle: "italic", color: "#666" }}>{money.envio}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 8,
                borderTop: `2px solid ${accent}`,
              }}
            >
              <span style={{ fontWeight: 700, color: head }}>TOTAL:</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: head }}>
                {money.total}
              </span>
            </div>
          </div>

          <div style={line(accent)} />

          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            <div>
              <span style={{ color: accent, fontWeight: 600 }}>Método de pago: </span>
              {method}
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ color: accent, fontWeight: 600 }}>Estado: </span>
              <span style={{ color: "#15803d", fontWeight: 700 }}>✅ PAGADO</span>
            </div>
          </div>

          <div style={line(accent)} />

          <div style={{ fontSize: 11, color: "#444", lineHeight: 1.65 }}>
            <div>📱 {formatInvoiceBusinessPhone()}</div>
            <div>📸 {SITE_INSTAGRAM_HANDLE}</div>
            <div>📍 {invoiceFooterLocationShort()}</div>
          </div>
        </div>
      </div>
    )
  }
)
InvoicePreview.displayName = "InvoicePreview"

export async function captureInvoiceToPng(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
  })
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))),
      "image/png",
      1
    )
  })
}
