"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase-server"
import type { WaitlistEntry } from "@/lib/types"

function mapWaitlistRow(row: Record<string, unknown>): WaitlistEntry {
  const pid = row.product_id
  return {
    id: String(row.id),
    product_id:
      pid == null || String(pid).trim() === "" ? null : String(pid),
    product_name: String(row.product_name),
    customer_name: String(row.customer_name),
    customer_phone: String(row.customer_phone),
    notified: row.notified === true,
    created_at: String(row.created_at),
  }
}

export async function getPendingWaitlistCount(): Promise<number> {
  const sb = createServiceRoleClient()
  const { count, error } = await sb
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .eq("notified", false)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const sb = createServiceRoleClient()
  const { data, error } = await sb
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapWaitlistRow(r as Record<string, unknown>))
}

export type MarkWaitlistNotifiedResult =
  | { success: true }
  | { success: false; error: string }

export async function markWaitlistNotified(
  id: string
): Promise<MarkWaitlistNotifiedResult> {
  const sb = createServiceRoleClient()
  const { error } = await sb
    .from("waitlist")
    .update({ notified: true })
    .eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/dashboard/lista-espera")
  revalidatePath("/admin/dashboard")
  return { success: true }
}
