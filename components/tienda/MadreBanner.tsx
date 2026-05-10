export function MadreBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-100 via-rose-50 to-skailea-cream">
      {/* Círculos decorativos */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-skailea-blush opacity-30" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-skailea-blush opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-skailea-gold opacity-15" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-5 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
        {/* Flor izquierda */}
        <span className="hidden text-4xl sm:block" aria-hidden>
          🌸
        </span>

        {/* Texto central */}
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-playfair text-lg font-bold italic text-skailea-charcoal sm:text-xl">
            🌷 Se aproxima el Día de las Madres
          </p>
          <p className="text-sm text-skailea-charcoal/70">
            Regálale el aroma que la hará sentir única — fragancias originales para la mamá más especial
          </p>
        </div>

        {/* Botón CTA */}
        <a
          href="#catalog-search"
          className="shrink-0 rounded-full bg-skailea-gold px-6 py-2.5 text-sm font-semibold text-skailea-charcoal shadow-sm transition hover:opacity-85 active:scale-95"
        >
          Ver fragancias 💐
        </a>

        {/* Flor derecha */}
        <span className="hidden text-4xl sm:block" aria-hidden>
          🌸
        </span>
      </div>
    </div>
  )
}
