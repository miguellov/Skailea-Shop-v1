/**
 * Texto del banner promocional (ticker). Editar aquí cuando quieras cambiar el mensaje.
 */
export const PROMO_BANNER_TICKER_TEXT =
  "💐 Día de las Madres · Regálale el aroma que la hará sentir única · 🌸 Envíos a todo el país · 💝 Precio especial por mayor · 🎁 El mejor regalo es un aroma que nunca olvida · 🌹 Fragancias originales para mamá"

export function PromoTicker() {
  const text = PROMO_BANNER_TICKER_TEXT

  return (
    <div className="mama-ticker relative z-[45] overflow-hidden border-b border-white/15 py-2.5">
      <div className="flex w-max animate-promo-marquee motion-reduce:animate-none">
        <p className="flex shrink-0 items-center whitespace-nowrap px-6 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[11px] sm:tracking-[0.2em]">
          {text}
        </p>
        <p
          className="flex shrink-0 items-center whitespace-nowrap px-6 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[11px] sm:tracking-[0.2em]"
          aria-hidden
        >
          {text}
        </p>
      </div>
    </div>
  )
}
