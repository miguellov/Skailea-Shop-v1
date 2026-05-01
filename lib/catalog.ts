import { createPublicServerClient } from "@/lib/supabase"
import { mapCategory, mapProductPublic } from "@/lib/db-map"
import type { Category, ProductPublic } from "@/lib/types"

export async function getStoreCatalog(): Promise<{
  categories: Category[]
  products: ProductPublic[]
}> {
  const supabase = createPublicServerClient()

  const [catRes, prodRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, sort_order, created_at")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products_with_category")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  if (catRes.error) {
    throw new Error(catRes.error.message)
  }
  if (prodRes.error) {
    throw new Error(prodRes.error.message)
  }

  const categories = (catRes.data ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>)
  )
  const products = (prodRes.data ?? []).map((r) =>
    mapProductPublic(r as Record<string, unknown>)
  )

  return { categories, products }
}
