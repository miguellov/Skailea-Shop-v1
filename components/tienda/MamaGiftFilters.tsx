"use client"

import type { LucideIcon } from "lucide-react"
import {
  Filter,
  Gem,
  Heart,
  Palette,
  Smile,
  Sparkles,
  Stars,
} from "lucide-react"
import type { MamaPersonalityTag } from "@/lib/mama-promo"
import { MAMA_PERSONALITY_TAGS } from "@/lib/mama-promo"

const PROFILE_DETAILS: Record<
  MamaPersonalityTag,
  { label: string; desc: string; icon: LucideIcon; color: string }
> = {
  todos: {
    label: "Ver todo el amor",
    desc: "Explorar la colección completa sin filtros.",
    icon: Smile,
    color: "from-stone-700 to-stone-900",
  },
  "mama-elegante": {
    label: "Mamá elegante",
    desc: "Colonias, sets premium y aromas sofisticados.",
    icon: Gem,
    color: "from-amber-500 to-yellow-600",
  },
  "mama-moderna": {
    label: "Mamá moderna",
    desc: "Splash VS, PINK y fragancias en tendencia.",
    icon: Stars,
    color: "from-purple-500 to-indigo-600",
  },
  "mama-romantica": {
    label: "Mamá romántica",
    desc: "Velas, florales y aromas dulces.",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
  },
  "mama-creativa": {
    label: "Mamá creativa",
    desc: "Exfoliantes, geles y detalles únicos.",
    icon: Palette,
    color: "from-teal-500 to-emerald-600",
  },
}

type Props = {
  selectedTag: MamaPersonalityTag
  onSelectTag: (tag: MamaPersonalityTag) => void
}

export function MamaGiftFilters({ selectedTag, onSelectTag }: Props) {
  const tagsToRender: MamaPersonalityTag[] = [
    "todos",
    ...MAMA_PERSONALITY_TAGS,
  ]

  return (
    <section
      id="regalo-perfecto"
      className="scroll-mt-6 border-b border-[var(--mama-primary)]/10 bg-[var(--mama-soft)]/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <header className="mb-10 space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-600">
            <Filter className="h-3.5 w-3.5" />
            <span>Buscador experto de regalos</span>
          </div>
          <h2 className="font-playfair text-2xl text-stone-900 md:text-4xl">
            ¿Cómo describirías el estilo de mamá?
          </h2>
          <p className="mx-auto max-w-md text-sm text-stone-500">
            Selecciona una personalidad y filtra automáticamente las fragancias
            ideales pensadas exclusivamente para ella.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tagsToRender.map((tag) => {
            const profile = PROFILE_DETAILS[tag] ?? {
              label: tag.replace(/-/g, " "),
              desc: "Colección de detalles especiales.",
              icon: Sparkles,
              color: "from-rose-400 to-pink-500",
            }
            const IconComponent = profile.icon
            const isSelected = selectedTag === tag

            return (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onSelectTag(tag)}
                  aria-pressed={isSelected}
                  className={`group relative flex h-36 w-full flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isSelected
                      ? "-translate-y-1 border-rose-500 bg-white shadow-lg shadow-rose-500/5 ring-2 ring-rose-500/20"
                      : "border-stone-200/80 bg-white/60 hover:border-stone-300 hover:bg-white hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <span className="animate-scale-in absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white motion-reduce:animate-none">
                      <svg
                        className="h-3 w-3 fill-none stroke-current stroke-2"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${profile.color} text-white shadow-inner transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </span>

                  <span className="mt-4 space-y-1">
                    <span
                      className={`block text-sm transition-colors ${
                        isSelected
                          ? "font-semibold text-rose-600"
                          : "font-medium text-stone-800"
                      }`}
                    >
                      {profile.label}
                    </span>
                    <span className="line-clamp-2 block text-[11px] leading-tight text-stone-400 group-hover:text-stone-500">
                      {profile.desc}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
