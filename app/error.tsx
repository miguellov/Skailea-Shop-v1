"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-skailea-cream px-6 text-center text-skailea-charcoal">
      <p className="font-playfair text-2xl font-semibold text-skailea-deep">
        Algo salió mal
      </p>
      <p className="max-w-md text-sm text-skailea-charcoal/75">
        {error.message || "No pudimos cargar la tienda. Intenta de nuevo."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-skailea-deep px-6 py-2.5 text-sm font-semibold text-skailea-cream"
      >
        Reintentar
      </button>
    </div>
  )
}
