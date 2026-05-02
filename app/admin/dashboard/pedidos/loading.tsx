export default function PedidosLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div
          className="h-12 w-12 shrink-0 rounded-full border-2 border-skailea-gold/70 border-t-skailea-rose animate-spin"
          aria-hidden
        />
        <div className="text-center sm:text-left">
          <p className="font-serif text-xl font-bold text-skailea-deep">
            Skailea
          </p>
          <p className="mt-0.5 text-sm font-medium text-skailea-charcoal/85">
            Cargando pedidos...
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-skailea-blush/45 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-2">
                <div className="h-5 w-40 rounded-md bg-skailea-blush/55" />
                <div className="h-4 w-28 rounded-md bg-skailea-blush/40" />
                <div className="mt-2 h-3 w-24 rounded bg-skailea-gold/25" />
              </div>
              <div className="h-6 w-20 rounded-full bg-skailea-deep/10" />
            </div>
            <div className="mt-4 space-y-2 border-t border-skailea-blush/30 pt-4">
              <div className="h-4 w-full rounded bg-skailea-blush/35" />
              <div className="h-4 max-w-md rounded bg-skailea-blush/30 sm:w-[80%]" />
            </div>
            <div className="mt-4 h-4 w-32 rounded-md bg-skailea-gold/20 sm:ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
