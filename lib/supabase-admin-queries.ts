import { mapCategory, mapProduct } from "@/lib/db-map"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Brand, Category, Product } from "@/lib/types"

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapProduct(r as Record<string, unknown>))
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
