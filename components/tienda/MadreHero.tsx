"use client"

export function MadreHero() {
  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="mama-hero-surface relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-[var(--mama-gold)]/15 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-white/8 blur-xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-10 text-center sm:px-6 sm:py-14">
        <span className="text-3xl sm:text-4xl" aria-hidden>
          💐🌹
        </span>

        <span className="mama-badge-pulse inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur-sm sm:text-sm">
          🎁 Día de las Madres
        </span>

        <h2 className="max-w-2xl font-playfair text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.75rem]">
          Para la Mamá más Especial
        </h2>

        <p className="max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
          Regálale una fragancia que la hará sentir única y especial
        </p>

        <button
          type="button"
          onClick={scrollToCatalog}
          className="mt-1 rounded-full bg-[var(--mama-gold)] px-8 py-3 text-sm font-semibold text-skailea-charcoal shadow-lg transition hover:brightness-105 active:scale-[0.98] motion-reduce:active:scale-100 sm:text-base"
        >
          Ver regalos para mamá 💐
        </button>
      </div>
    </section>
  )
}
