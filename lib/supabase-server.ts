import { createClient } from "@supabase/supabase-js"

/** Decodifica el payload de un JWT (solo para inspección local, sin verificar firma). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const pad = base64.length % 4
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64
    const json = atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

let warnedAnonAsServiceRole = false

function warnIfAnonKeyUsedAsServiceRole(secret: string): void {
  if (warnedAnonAsServiceRole) return
  const payload = decodeJwtPayload(secret)
  const role = typeof payload?.role === "string" ? payload.role : ""
  if (role === "anon") {
    warnedAnonAsServiceRole = true
    console.error(
      "[supabase-server] La clave en SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY es la clave ANÓNIMA (JWT role=anon). " +
        "Para createServiceRoleClient debe ser la service_role: Supabase → Project Settings → API → pestaña Legacy → copiar «service_role». " +
        "En Vercel, actualiza SUPABASE_SECRET_KEY y haz redeploy."
    )
  }
}

/**
 * Cliente con clave anónima (`anon`). Respeta RLS; usar en server actions
 * invocados desde la tienda pública (p. ej. insertar pedidos).
 */
export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    ""

  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    )
  }

  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

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

  warnIfAnonKeyUsedAsServiceRole(secret)

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
