"use client"

import {
  ArrowRight,
  Gift,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

type Props = {
  onExploreClick?: () => void
}

export function MadreHero({ onExploreClick }: Props) {
  const scrollToAssistant = () => {
    document
      .getElementById("regalo-perfecto")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  const explore = () => {
    if (onExploreClick) {
      onExploreClick()
      return
    }
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden bg-gradient-to-tr from-rose-100/60 via-amber-50/40 to-pink-100/50 px-4 py-16 md:min-h-[85vh]">
      <div
        className="animate-blob absolute left-10 top-12 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl motion-reduce:animate-none"
        aria-hidden
      />
      <div
        className="animate-blob animation-delay-2000 absolute bottom-10 right-10 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl motion-reduce:animate-none"
        aria-hidden
      />
      <div
        className="animate-blob animation-delay-4000 absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-pink-300/10 blur-3xl motion-reduce:animate-none"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e11d4805_1px,transparent_1px),linear-gradient(to_bottom,#e11d4805_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
        <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-600 shadow-sm motion-reduce:animate-none md:text-sm">
          <Sparkles className="h-4 w-4 animate-spin-slow text-amber-500 motion-reduce:animate-none" />
          <span>Edición celebración de las Madres</span>
          <Heart className="h-3.5 w-3.5 animate-pulse fill-rose-500 text-rose-500 motion-reduce:animate-none" />
        </div>

        <div className="space-y-4">
          <h2 className="font-playfair text-4xl leading-[1.1] tracking-tight text-stone-950 sm:text-5xl md:text-7xl">
            El arte de agradecer <br />
            <span className="relative inline-block bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text font-normal italic text-transparent">
              a quien nos dio todo
              <span
                className="absolute bottom-2 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-rose-400/0 via-rose-400/60 to-rose-400/0"
                aria-hidden
              />
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-stone-600 sm:text-lg md:text-xl">
            Descubre nuestra curaduría de fragancias originales, sets BBW y
            detalles pensados para iluminar el día de mamá.
          </p>
        </div>

        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={explore}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-4 text-sm font-medium tracking-wide text-white shadow-xl shadow-stone-900/10 transition-all duration-300 hover:scale-[1.02] hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-500/20 active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:w-auto md:text-base"
          >
            <Gift className="h-5 w-5" />
            Ver catálogo para mamá
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
          </button>

          <button
            type="button"
            onClick={scrollToAssistant}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200/80 bg-white/80 px-6 py-4 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-rose-300 hover:text-rose-600 hover:shadow-md sm:w-auto md:text-base"
          >
            Asistente de regalos
          </button>
        </div>

        <ul className="mx-auto grid max-w-3xl grid-cols-1 gap-4 border-t border-stone-200/60 pt-12 text-xs font-semibold uppercase tracking-wider text-stone-500 sm:grid-cols-3">
          <li className="flex items-center justify-center gap-2.5 rounded-xl bg-white/40 px-4 py-2.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
            Sets listos para regalar
          </li>
          <li className="flex items-center justify-center gap-2.5 rounded-xl bg-white/40 px-4 py-2.5 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            Productos 100% originales
          </li>
          <li className="flex items-center justify-center gap-2.5 rounded-xl bg-white/40 px-4 py-2.5 backdrop-blur-sm">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-amber-500 motion-reduce:animate-none"
              aria-hidden
            />
            Envíos a todo RD
          </li>
        </ul>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-skailea-cream to-transparent"
        aria-hidden
      />
    </section>
  )
}
