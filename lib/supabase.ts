import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/** Clave pública (publishable / anon) para el navegador y lecturas públicas en el servidor. */
export function getPublishableKey(): string {
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim()
  if (!key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    )
  }
  return key
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local")
  }
  return url
}

/**
 * Cliente Supabase para Client Components (navegador).
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(getSupabaseUrl(), getPublishableKey())
}

/**
 * Cliente solo lectura para Server Components / Route Handlers públicos (RLS con rol anon).
 */
export function createPublicServerClient() {
  return createSupabaseClient(getSupabaseUrl(), getPublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
