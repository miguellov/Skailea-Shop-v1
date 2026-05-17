"use client"

import { useCallback, useEffect, useState } from "react"
import { MAMA_WELCOME_STORAGE_KEY } from "@/lib/mama-promo"

export function MamaWelcomePopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(MAMA_WELCOME_STORAGE_KEY) === "1") return
    const t = window.setTimeout(() => setVisible(true), 600)
    return () => window.clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    sessionStorage.setItem(MAMA_WELCOME_STORAGE_KEY, "1")
    setVisible(false)
  }, [])

  const goToCatalog = useCallback(() => {
    dismiss()
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
  }, [dismiss])

  if (!visible) return null

  return (
    <>
      <MotionSafeOverlay onClick={dismiss} />
      <div
        className="mama-welcome-popup mama-popup-enter fixed left-1/2 top-1/2 z-[81] w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/25 shadow-2xl sm:w-[min(100%,26rem)]"
        role="dialog"
        aria-labelledby="mama-welcome-title"
        aria-modal="true"
      >
        <div className="relative px-6 py-8 text-center text-white">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
            <span className="absolute left-3 top-2 text-2xl">🌸</span>
            <span className="absolute right-4 top-4 text-xl">🌹</span>
            <span className="absolute bottom-3 left-6 text-lg">💐</span>
            <span className="absolute bottom-5 right-3 text-2xl">🌷</span>
          </div>

          <p
            id="mama-welcome-title"
            className="relative font-playfair text-2xl font-bold leading-tight"
          >
            💐 Día de las Madres
          </p>
          <p className="relative mt-3 text-sm leading-relaxed text-white/95">
            Encuentra el regalo perfecto para mamá
          </p>
          <p className="relative mt-2 text-xs leading-relaxed text-white/85">
            Fragancias originales · Envíos a todo RD
          </p>

          <button
            type="button"
            onClick={goToCatalog}
            className="relative mt-6 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--mama-secondary)] shadow-md transition hover:bg-[var(--mama-soft)] active:scale-[0.98] motion-reduce:active:scale-100"
          >
            Ver regalos 🌸
          </button>

          <button
            type="button"
            onClick={dismiss}
            className="relative mt-3 text-xs text-white/75 underline-offset-2 hover:text-white hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}

function MotionSafeOverlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
      role="presentation"
      aria-hidden
      onClick={onClick}
    />
  )
}
