import { mapCategory, mapProduct } from "@/lib/db-map"
import { createPublicServerClient } from "@/lib/supabase"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Brand, Category, Product } from "@/lib/types"

/**
 * Catálogo admin: preferir `createServiceRoleClient()` (SUPABASE_SECRET_KEY) para
 * bypass RLS. Si falla creación o consulta, fallback a cliente anon con join a categorías.
 */
async function fetchAllProductsAdminPublicFallback(): Promise<Product[]> {
  const sb = createPublicServerClient()
  const { data, error } = await sb
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })
    .limit(2000)

  console.log("Admin productos:", data?.length)

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => {
    const flat = { ...(r as Record<string, unknown>) }
    delete flat.categories
    return mapProduct(flat)
  })
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  try {
    const sb = createServiceRoleClient()
    const { data, error } = await sb
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000)

    console.log("Admin productos:", data?.length)

    if (error) throw error
    return (data ?? []).map((r) => mapProduct(r as Record<string, unknown>))
  } catch (err) {
    console.warn(
      "[fetchAllProductsAdmin] service role falló; usando cliente público:",
      err
    )
    return fetchAllProductsAdminPublicFallback()
  }
}

export async function fetchAllCategoriesAdmin(): Promise<Category[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapCategory(r as Record<string, unknown>))
}

export async function fetchAllBrandsAdmin(): Promise<Brand[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("brands")
    .select("id, name, created_at")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>
    return {
      id: String(row.id),
      name: String(row.name),
      created_at:
        row.created_at == null ? undefined : String(row.created_at),
    }
  })
}
