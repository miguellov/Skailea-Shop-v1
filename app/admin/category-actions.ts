"use server"

import { revalidatePath } from "next/cache"
import { slugifyCategoryName } from "@/lib/slugify"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Category } from "@/lib/types"

export type CategoryWithCount = Category & { product_count: number }

function revalidateCatalogAdmin() {
  revalidatePath("/")
  revalidatePath("/admin/dashboard/productos")
  revalidatePath("/admin/dashboard/categorias")
}

async function resolveUniqueSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const sb = createServiceRoleClient()
  let slug = base
  let n = 0
  while (true) {
    const { data, error } = await sb
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
    if (error) throw new Error(error.message)
    const row = data as { id: string } | null
    if (!row) return slug
    if (excludeId && row.id === excludeId) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const sb = createServiceRoleClient()
  const { data: cats, error: e1 } = await sb
    .from("categories")
    .select("id, name, slug, sort_order, created_at")
    .order("sort_order", { ascending: true })

  if (e1) throw new Error(e1.message)

  const { data: countsRows, error: e2 } = await sb
    .from("products")
    .select("category_id")

  if (e2) throw new Error(e2.message)

  const byCat = new Map<string, number>()
  for (const r of countsRows ?? []) {
    const cid = (r as { category_id: string | null }).category_id
    if (!cid) continue
    byCat.set(cid, (byCat.get(cid) ?? 0) + 1)
  }

  return (cats ?? []).map((row) => {
    const c = row as Record<string, unknown>
    const id = String(c.id)
    return {
      id,
      name: String(c.name),
      slug: String(c.slug),
      sort_order:
        c.sort_order == null ? undefined : Number(c.sort_order),
      created_at:
        c.created_at == null ? undefined : String(c.created_at),
      product_count: byCat.get(id) ?? 0,
    }
  })
}

export async function createCategoryAction(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("El nombre es obligatorio")

  const sb = createServiceRoleClient()
  const base = slugifyCategoryName(trimmed)
  const slug = await resolveUniqueSlug(base)

  const { data: maxRow } = await sb
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder =
    maxRow && typeof (maxRow as { sort_order: number }).sort_order === "number"
      ? (maxRow as { sort_order: number }).sort_order + 1
      : 1

  const { error } = await sb.from("categories").insert({
    name: trimmed,
    slug,
    sort_order: nextOrder,
  })

  if (error) throw new Error(error.message)
  revalidateCatalogAdmin()
}

export async function updateCategoryAction(id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("El nombre es obligatorio")

  const sb = createServiceRoleClient()
  const base = slugifyCategoryName(trimmed)
  const slug = await resolveUniqueSlug(base, id)

  const { error } = await sb
    .from("categories")
    .update({ name: trimmed, slug })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidateCatalogAdmin()
}

export async function deleteCategoryAction(id: string) {
  const sb = createServiceRoleClient()
  const { count, error: cErr } = await sb
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)

  if (cErr) throw new Error(cErr.message)
  if ((count ?? 0) > 0) {
    throw new Error("No se puede eliminar: hay productos en esta categoría.")
  }

  const { error } = await sb.from("categories").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidateCatalogAdmin()
}
