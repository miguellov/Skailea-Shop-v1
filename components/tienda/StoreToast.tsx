"use client"

import { useEffect, useRef } from "react"

export function StoreToast({
  message,
  open,
  onClose,
  durationMs = 3200,
}: {
  message: string
  open: boolean
  onClose: () => void
  durationMs?: number
}) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open || !message) return
    const t = window.setTimeout(() => onCloseRef.current(), durationMs)
    return () => window.clearTimeout(t)
  }, [open, message, durationMs])

  if (!open || !message) return null

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[100] max-w-[min(92vw,20rem)] -translate-x-1/2 rounded-2xl border border-skailea-gold/40 bg-skailea-deep px-4 py-3 text-center text-sm font-medium text-skailea-cream shadow-lg shadow-black/25"
    >
      {message}
    </div>
  )
}
