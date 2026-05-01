"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { Brand } from "@/lib/types"

function revalidateBrandPaths() {
  revalidatePath("/")
  revalidatePath("/admin/dashboard/productos")
  revalidatePath("/admin/dashboard/categorias")
}

export async function listBrands(): Promise<Brand[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("brands")
    .select("id, name, created_at")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>
    return {
      id: String(r.id),
      name: String(r.name),
      created_at:
        r.created_at == null ? undefined : String(r.created_at),
    }
  })
}

export async function createBrandAction(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("El nombre es obligatorio")

  const sb = createServiceRoleClient()
  const { error } = await sb.from("brands").insert({ name: trimmed })

  if (error) throw new Error(error.message)
  revalidateBrandPaths()
}

export async function updateBrandAction(id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("El nombre es obligatorio")

  const sb = createServiceRoleClient()
  const { error } = await sb.from("brands").update({ name: trimmed }).eq("id", id)

  if (error) throw new Error(error.message)
  revalidateBrandPaths()
}

export async function deleteBrandAction(id: string) {
  const sb = createServiceRoleClient()
  const { error } = await sb.from("brands").delete().eq("id", id)

  if (error) throw new Error(error.message)
  revalidateBrandPaths()
}
