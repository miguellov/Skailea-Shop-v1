import { createPublicServerClient } from "@/lib/supabase"
import { mapCategory, mapProductPublic } from "@/lib/db-map"
import type { Brand, Category, ProductPublic } from "@/lib/types"

export async function getStoreCatalog(): Promise<{
  categories: Category[]
  brands: Brand[]
  products: ProductPublic[]
}> {
  const supabase = createPublicServerClient()

  const [catRes, brandRes, prodRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, sort_order, created_at")
      .order("sort_order", { ascending: true }),
    supabase
      .from("brands")
      .select("id, name, created_at")
      .order("name", { ascending: true }),
    supabase
      .from("products_with_category")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  if (catRes.error) {
    throw new Error(catRes.error.message)
  }
  if (brandRes.error) {
    throw new Error(brandRes.error.message)
  }
  if (prodRes.error) {
    throw new Error(prodRes.error.message)
  }

  const categories = (catRes.data ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>)
  )
  const brands = (brandRes.data ?? []).map((r) => {
    const row = r as Record<string, unknown>
    return {
      id: String(row.id),
      name: String(row.name),
      created_at:
        row.created_at == null ? undefined : String(row.created_at),
    } satisfies Brand
  })
  const products = (prodRes.data ?? []).map((r) =>
    mapProductPublic(r as Record<string, unknown>)
  )

  return { categories, brands, products }
}
