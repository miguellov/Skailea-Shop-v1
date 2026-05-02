"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { markOrderAsPaid } from "@/app/admin/order-actions"
import type { Order, PaymentMethod } from "@/lib/types"
import { captureInvoiceToPng, InvoicePreview } from "@/components/admin/InvoicePreview"
import { MarkPaidModal } from "@/components/admin/MarkPaidModal"

export function OrderInvoiceControls({
  order,
  onRefresh,
}: {
  order: Order
  /** Si viene del panel de pedidos, usa el mismo refresh (p. ej. con useTransition). */
  onRefresh?: () => void
}) {
  const router = useRouter()
  const [markOpen, setMarkOpen] = useState(false)
  const [captureOrder, setCaptureOrder] = useState<Order | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  async function onPickPayment(method: PaymentMethod) {
    const result = await markOrderAsPaid(order.id, method)
    if (!result.success) {
      window.alert("Error: " + result.error)
      return
    }
    if (onRefresh) onRefresh()
    else router.refresh()
    setMarkOpen(false)
  }

  async function runCapture(): Promise<Blob | null> {
    setCaptureOrder(order)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await new Promise((r) => setTimeout(r, 100))
    try {
      const el = invoiceRef.current
      if (!el) return null
      return await captureInvoiceToPng(el)
    } finally {
      setCaptureOrder(null)
    }
  }

  async function handleDownloadInvoice() {
    if (!order.invoice_number || !order.paid) return
    try {
      const blob = await runCapture()
      if (!blob) throw new Error("No se pudo generar la imagen")
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Factura-${order.invoice_number}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al generar PNG")
    }
  }

  async function handleShareInvoice() {
    if (!order.invoice_number || !order.paid) return
    try {
      const blob = await runCapture()
      if (!blob) throw new Error("No se pudo generar la imagen")
      const file = new File([blob], `Factura-${order.invoice_number}.png`, {
        type: "image/png",
      })
      const payload = {
        files: [file],
        title: "Factura Skailea Shop",
        text: `Factura ${order.invoice_number}`,
      }
      if (navigator.share && (!navigator.canShare || navigator.canShare(payload))) {
        try {
          await navigator.share(payload)
          return
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return
          /* fallback descarga */
        }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Factura-${order.invoice_number}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      window.alert(
        "Imagen descargada. En el móvil puedes compartirla desde la galería a WhatsApp; en escritorio adjunta el archivo manualmente en WhatsApp Web."
      )
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
      window.alert(e instanceof Error ? e.message : "Error al compartir")
    }
  }

  return (
    <>
      {captureOrder && (
        <div
          className="pointer-events-none fixed left-[-12000px] top-0 z-[5]"
          aria-hidden
        >
          <InvoicePreview ref={invoiceRef} order={captureOrder} />
        </div>
      )}
      <MarkPaidModal
        open={markOpen}
        customerLabel={order.customer_name}
        onClose={() => setMarkOpen(false)}
        onChoose={(m) => void onPickPayment(m)}
      />
      <div className="mt-3 flex flex-wrap gap-2 border-t border-skailea-blush/25 pt-3">
        {!order.paid && (
          <button
            type="button"
            onClick={() => setMarkOpen(true)}
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-105 sm:text-sm"
          >
            💰 Marcar como Pagado
          </button>
        )}
        {order.paid && order.invoice_number && (
          <>
            <button
              type="button"
              onClick={() => void handleDownloadInvoice()}
              className="rounded-full border border-skailea-deep/25 bg-white px-4 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-blush/30 sm:text-sm"
            >
              🧾 Generar Factura · 📥 Descargar PNG
            </button>
            <button
              type="button"
              onClick={() => void handleShareInvoice()}
              className="rounded-full border border-[#128C7E]/40 bg-[#dcf8c6] px-4 py-2 text-xs font-semibold text-skailea-deep hover:bg-[#c8f0b5] sm:text-sm"
            >
              📤 Compartir por WhatsApp
            </button>
          </>
        )}
      </div>
    </>
  )
}
