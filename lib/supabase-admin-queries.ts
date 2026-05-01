import { mapCategory, mapProduct } from "@/lib/db-map"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Category, Product } from "@/lib/types"

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
