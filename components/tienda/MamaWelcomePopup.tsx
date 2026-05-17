"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight, Gift, Heart, Sparkles, X } from "lucide-react"
import { StoreToast } from "@/components/tienda/StoreToast"
import { MAMA_COUPON_CODE, MAMA_POPUP_STORAGE_KEY } from "@/lib/mama-promo"

export function MamaWelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(MAMA_POPUP_STORAGE_KEY) === "true") return
    const timer = window.setTimeout(() => setIsOpen(true), 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const closePopup = useCallback(() => {
    localStorage.setItem(MAMA_POPUP_STORAGE_KEY, "true")
    setIsOpen(false)
  }, [])

  const exploreGifts = useCallback(() => {
    closePopup()
    document
      .getElementById("regalo-perfecto")
      ?.scrollIntoView({ behavior: "smooth" })
  }, [closePopup])

  const copyCoupon = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MAMA_COUPON_CODE)
      setCopied(true)
    } catch {
      /* clipboard no disponible */
    }
  }, [])

  if (!isOpen) return null

  return (
    <>
      <MotionSafeOverlay onClick={closePopup} />

      <div
        className="animate-fade-in fixed left-1/2 top-1/2 z-[51] flex max-h-[90vh] w-[min(100%,48rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-rose-100/50 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-2xl motion-reduce:animate-none md:max-h-none md:flex-row"
        role="dialog"
        aria-labelledby="mama-welcome-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-stone-500 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:text-rose-600 motion-reduce:hover:scale-100"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative flex min-h-[220px] w-full flex-col justify-between overflow-hidden bg-gradient-to-tr from-[var(--mama-primary)] to-pink-500 p-8 text-white md:min-h-[420px] md:w-1/2">
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-amber-200/20 blur-2xl"
            aria-hidden
          />

          <div className="relative flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-200 motion-reduce:animate-none" />
            Especial de las Madres
          </div>

          <div className="relative my-auto space-y-3 py-6 md:py-0">
            <p
              id="mama-welcome-title"
              className="font-playfair text-3xl leading-tight md:text-4xl"
            >
              Para quien merece <br />
              <span className="font-normal italic text-amber-200">
                todo el amor
              </span>{" "}
              <br />
              del mundo.
            </p>
            <p className="max-w-xs text-sm text-rose-100">
              Fragancias originales y sets curados para celebrar a mamá con un
              aroma que nunca olvida.
            </p>
          </div>

          <div className="relative flex items-center gap-2 border-t border-white/20 pt-4 text-xs text-rose-100/80">
            <Heart className="animate-beat h-4 w-4 fill-white text-white motion-reduce:animate-none" />
            Envíos a todo RD · Precio especial por mayor
          </div>
        </div>

        <div className="flex w-full flex-col justify-center overflow-y-auto p-8 md:w-1/2 md:p-10">
          <div className="space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="font-playfair text-2xl text-stone-800 md:text-3xl">
                ¡Sorpréndela hoy!
              </h3>
              <p className="text-sm leading-relaxed text-stone-600">
                Usa el código exclusivo y obtén un{" "}
                <span className="rounded bg-rose-50 px-1.5 py-0.5 font-bold text-rose-600">
                  10% OFF
                </span>{" "}
                en sets y fragancias seleccionadas para mamá.
              </p>
            </div>

            <div className="bg-dashed-border flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-rose-200 bg-stone-50 p-4 transition-colors hover:border-rose-400">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Cupón exclusivo
                </span>
                <span className="font-mono text-xl font-bold tracking-wider text-stone-800 selection:bg-rose-100">
                  {MAMA_COUPON_CODE}
                </span>
              </div>
              <button
                type="button"
                onClick={copyCoupon}
                className="shrink-0 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 shadow-sm transition-all duration-300 hover:border-rose-600 hover:bg-rose-600 hover:text-white"
              >
                Copiar
              </button>
            </div>

            <ul className="mx-auto max-w-xs space-y-2 text-left text-xs text-stone-500 md:mx-0">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                Sets BBW y Victoria&apos;s Secret originales.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                Arma tu pedido por WhatsApp en minutos.
              </li>
            </ul>

            <button
              type="button"
              onClick={exploreGifts}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 py-3.5 text-sm font-medium tracking-wide text-white shadow-lg shadow-rose-500/20 transition-all duration-200 hover:from-rose-600 hover:to-pink-700 hover:shadow-rose-500/30 active:scale-[0.98] motion-reduce:active:scale-100"
            >
              <Gift className="h-4 w-4" />
              Explorar colección de regalos
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <StoreToast
        message="¡Código copiado! Úsalo en tu mensaje de pedido."
        open={copied}
        onClose={() => setCopied(false)}
      />
    </>
  )
}

function MotionSafeOverlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 bg-black/60 backdrop-blur-md motion-reduce:animate-none motion-reduce:backdrop-blur-none"
      role="presentation"
      aria-hidden
      onClick={onClick}
    />
  )
}
