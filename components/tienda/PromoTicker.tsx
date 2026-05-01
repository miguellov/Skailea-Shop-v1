/**
 * Texto del banner promocional (ticker). Editar aquí cuando quieras cambiar el mensaje.
 */
export const PROMO_BANNER_TICKER_TEXT =
  "✨ Envíos a todo el país · 🎁 Precio especial por mayor · 💛 Productos 100% originales · 📦 Haz tu pedido por WhatsApp"

export function PromoTicker() {
  const text = PROMO_BANNER_TICKER_TEXT

  return (
    <div className="relative z-[45] overflow-hidden border-b border-skailea-deep/15 bg-skailea-gold py-2.5">
      <div className="flex w-max animate-promo-marquee">
        <p className="flex shrink-0 items-center whitespace-nowrap px-6 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-skailea-deep sm:text-[11px] sm:tracking-[0.22em]">
          {text}
        </p>
        <p
          className="flex shrink-0 items-center whitespace-nowrap px-6 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-skailea-deep sm:text-[11px] sm:tracking-[0.22em]"
          aria-hidden
        >
          {text}
        </p>
      </div>
    </div>
  )
}
