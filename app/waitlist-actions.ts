"use server"

import { createPublicServerClient } from "@/lib/supabase-server"

export type SubmitWaitlistResult =
  | { success: true }
  | { success: false; error: string }

export async function submitWaitlistEntry(input: {
  product_id: string
  product_name: string
  customer_name: string
  customer_phone: string
}): Promise<SubmitWaitlistResult> {
  const name = input.customer_name.trim()
  const phone = input.customer_phone.trim()
  const pname = input.product_name.trim()
  if (!name || !phone || !pname || !input.product_id.trim()) {
    return { success: false, error: "Completa nombre y WhatsApp." }
  }

  const sb = createPublicServerClient()
  const { error } = await sb.from("waitlist").insert({
    product_id: input.product_id.trim(),
    product_name: pname,
    customer_name: name,
    customer_phone: phone,
  })

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}
