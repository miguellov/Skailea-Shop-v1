import { createPublicServerClient } from "@/lib/supabase"
import { mapCategory, mapProductPublic } from "@/lib/db-map"
import type { Brand, Category, ProductPublic } from "@/lib/types"

/**
 * Catálogo público con `createPublicServerClient()` (clave **anon / publishable**).
 * Si en producción ves pocas filas, revisa RLS para rol `anon` en tablas y vista.
 * Ver `scripts/catalog-public-rls.sql`.
 */
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
      .order("created_at", { ascending: false })
      .limit(2000),
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

  const rawProductRows = prodRes.data?.length ?? 0
  console.log("[getStoreCatalog] filas brutas products_with_category:", rawProductRows)

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

  console.log("Productos encontrados:", products.length)
  console.log(
    "[getStoreCatalog] categorías:",
    categories.length,
    "marcas:",
    brands.length
  )

  return { categories, brands, products }
}
