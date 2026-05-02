import { createClient } from "@supabase/supabase-js"

/**
 * Cliente con clave secreta (service role). Solo importar desde Server Actions,
 * Route Handlers o Server Components que no se serialicen al cliente.
 * Bypassa RLS.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  /** Preferir `SUPABASE_SECRET_KEY` (nombre actual en Supabase / dashboard). */
  const secret = (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  ).trim()

  if (!url || !secret) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY) en .env.local"
    )
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
