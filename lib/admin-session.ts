/** Clave en sessionStorage cuando el PIN admin es válido (CURSOR.md) */
export const ADMIN_SESSION_KEY = "skailea_admin_session"

export function isAdminSessionMarked(value: string | null): boolean {
  return value === "1"
}
