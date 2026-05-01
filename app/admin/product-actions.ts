"use server"

import { revalidatePath } from "next/cache"
import {
  fetchAllBrandsAdmin,
  fetchAllCategoriesAdmin,
  fetchAllProductsAdmin,
} from "@/lib/supabase-admin-queries"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Brand, Category, Product } from "@/lib/types"

const RESTOCK_DEFAULT = 10

export async function getAdminProducts(): Promise<Product[]> {
  return fetchAllProductsAdmin()
}

export async function getAdminCategories(): Promise<Category[]> {
  return fetchAllCategoriesAdmin()
}

export async function getAdminBrands(): Promise<Brand[]> {
  return fetchAllBrandsAdmin()
}

export type ProductUpsertInput = {
  name: string
  category_id: string | null
  brand_id: string | null
  price: number
  price_mayor: number
  mayor_min: number
  stock: number
  image_url: string | null
  image_urls: string[]
  active: boolean
}

export async function createProductAction(input: ProductUpsertInput) {
  const sb = createServiceRoleClient()
  const { error } = await sb.from("products").insert({
    name: input.name,
    category_id: input.category_id,
    brand_id: input.brand_id,
    price: input.price,
    price_mayor: input.price_mayor,
    mayor_min: input.mayor_min,
    stock: input.stock,
    image_url: input.image_url,
    image_urls: input.image_urls,
    active: input.active,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/productos")
  revalidatePath("/admin/dashboard/categorias")
}

export async function updateProductAction(id: string, input: ProductUpsertInput) {
  const sb = createServiceRoleClient()
  const { error } = await sb
    .from("products")
    .update({
      name: input.name,
      category_id: input.category_id,
      brand_id: input.brand_id,
      price: input.price,
      price_mayor: input.price_mayor,
      mayor_min: input.mayor_min,
      stock: input.stock,
      image_url: input.image_url,
      image_urls: input.image_urls,
      active: input.active,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/productos")
  revalidatePath("/admin/dashboard/categorias")
}

export async function deleteProductAction(id: string) {
  const sb = createServiceRoleClient()
  const { error } = await sb.from("products").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/productos")
  revalidatePath("/admin/dashboard/categorias")
}

export async function toggleProductStockAction(id: string) {
  const sb = createServiceRoleClient()
  const { data: row, error: fetchErr } = await sb
    .from("products")
    .select("stock")
    .eq("id", id)
    .single()

  if (fetchErr) throw new Error(fetchErr.message)
  const current = Number((row as { stock: number }).stock)
  const nextStock = current > 0 ? 0 : RESTOCK_DEFAULT

  const { error } = await sb
    .from("products")
    .update({ stock: nextStock })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/productos")
  revalidatePath("/admin/dashboard/categorias")
}
