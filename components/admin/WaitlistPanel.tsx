"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { markWaitlistNotified } from "@/app/admin/waitlist-actions"
import type { WaitlistEntry } from "@/lib/types"
import { normalizePhoneForWhatsAppRD, whatsappUrl } from "@/lib/utils"

function buildWaitlistNotifyMessage(
  customerName: string,
  productName: string
): string {
  return `Hola ${customerName}! 🌸 Te escribimos de Skailea Shop.
El producto ${productName} que querías ya está disponible! Visita nuestra tienda:
skaileashop.com 🛍️`
}

export function WaitlistPanel({
  initialEntries,
}: {
  initialEntries: WaitlistEntry[]
}) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function notifyHref(row: WaitlistEntry): string | null {
    const digits = normalizePhoneForWhatsAppRD(row.customer_phone)
    if (!digits) return null
    const msg = buildWaitlistNotifyMessage(
      row.customer_name.trim(),
      row.product_name
    )
    const href = whatsappUrl(digits, msg)
    return href === "#" ? null : href
  }

  function handleMarked(id: string) {
    startTransition(async () => {
      setError(null)
      const res = await markWaitlistNotified(id)
      if (!res.success) {
        setError(res.error)
        return
      }
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, notified: true } : e))
      )
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-skailea-deep">
          Lista de espera
        </h1>
        <p className="mt-1 text-sm text-skailea-charcoal/80">
          Clientes que pidieron aviso cuando un producto agotado vuelva a
          stock.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-skailea-blush/40 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-skailea-blush/40 bg-skailea-cream/80 text-xs font-semibold uppercase tracking-wide text-skailea-deep/80">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-skailea-blush/30">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-skailea-charcoal/70"
                >
                  No hay registros en lista de espera.
                </td>
              </tr>
            ) : (
              entries.map((row) => {
                const wa = notifyHref(row)
                return (
                  <tr key={row.id} className="text-skailea-deep">
                    <td className="max-w-[200px] px-4 py-3 font-medium leading-snug">
                      {row.product_name}
                    </td>
                    <td className="px-4 py-3">{row.customer_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-skailea-charcoal/85">
                      {row.customer_phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-skailea-charcoal/75">
                      {new Date(row.created_at).toLocaleString("es-DO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {row.notified ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Notificado
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {wa && !row.notified ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-full bg-[#25D366]/15 px-3 py-1.5 text-xs font-semibold text-[#128C7E] ring-1 ring-[#25D366]/35 hover:bg-[#25D366]/25"
                          >
                            💬 Notificar
                          </a>
                        ) : null}
                        {!row.notified ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => handleMarked(row.id)}
                            className="inline-flex rounded-full border border-skailea-gold/50 bg-skailea-cream px-3 py-1.5 text-xs font-semibold text-skailea-deep hover:bg-skailea-blush/40 disabled:opacity-50"
                          >
                            ✅ Marcar como notificado
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
