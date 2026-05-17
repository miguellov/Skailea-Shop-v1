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

export function isMamaGiftCategory(categoryName: string | null | undefined): boolean {
  if (!categoryName) return false
  const lower = categoryName.toLowerCase()
  return MAMA_GIFT_NAMES_LOWER.some(
    (n) => lower === n || lower.includes(n)
  )
}

export const MAMA_WELCOME_STORAGE_KEY = "skailea-mama-welcome-dismissed"

export type MamaPriceRange = "under-1000" | "1000-2000" | "over-2000" | null

export function productMatchesMamaPriceRange(
  price: number,
  range: MamaPriceRange
): boolean {
  if (!range) return true
  if (range === "under-1000") return price <= 1000
  if (range === "1000-2000") return price > 1000 && price <= 2000
  return price > 2000
}
