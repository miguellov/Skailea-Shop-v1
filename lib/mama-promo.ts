/** Categorías que muestran badge "Ideal para mamá" (por nombre, case-insensitive). */
export const MAMA_GIFT_CATEGORY_NAMES = [
  "SET BBW Mujer",
  "Splash Victoria Secret",
  "Velas 3 Mecha BBW",
  "Exfoliantes PINK",
  "Colonias BBW",
] as const

const MAMA_GIFT_NAMES_LOWER = MAMA_GIFT_CATEGORY_NAMES.map((n) =>
  n.toLowerCase()
)

export function isMamaGiftCategory(
  categoryName: string | null | undefined
): boolean {
  if (!categoryName) return false
  const lower = categoryName.toLowerCase()
  return MAMA_GIFT_NAMES_LOWER.some(
    (n) => lower === n || lower.includes(n)
  )
}

export const MAMA_POPUP_STORAGE_KEY = "mama_popup_seen_v2"

export const MAMA_COUPON_CODE = "PARAMAMA10"

export type MamaPersonalityTag =
  | "todos"
  | "mama-elegante"
  | "mama-moderna"
  | "mama-romantica"
  | "mama-creativa"

export const MAMA_PERSONALITY_TAGS: MamaPersonalityTag[] = [
  "mama-elegante",
  "mama-moderna",
  "mama-romantica",
  "mama-creativa",
]

type ProductForMamaFilter = {
  category_name?: string | null
  category_slug?: string | null
  name: string
  price: number
}

export function productMatchesMamaPersonality(
  product: ProductForMamaFilter,
  tag: MamaPersonalityTag
): boolean {
  if (tag === "todos") return true

  const cat = (product.category_name ?? "").toLowerCase()
  const slug = (product.category_slug ?? "").toLowerCase()
  const name = product.name.toLowerCase()

  switch (tag) {
    case "mama-elegante":
      return (
        cat.includes("colonia") ||
        cat.includes("set bbw") ||
        slug.includes("colonia") ||
        slug.includes("set-bbw") ||
        product.price > 1500
      )
    case "mama-moderna":
      return (
        cat.includes("splash") ||
        cat.includes("victoria") ||
        cat.includes("pink") ||
        slug.includes("splash") ||
        slug.includes("pink")
      )
    case "mama-romantica":
      return (
        cat.includes("vela") ||
        cat.includes("splash") ||
        slug.includes("vela") ||
        name.includes("love") ||
        name.includes("rose") ||
        name.includes("romantic")
      )
    case "mama-creativa":
      return (
        cat.includes("exfoliante") ||
        cat.includes("gel") ||
        cat.includes("pink") ||
        slug.includes("exfoliante") ||
        slug.includes("gel")
      )
    default:
      return true
  }
}
