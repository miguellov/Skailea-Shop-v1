/** URL base del propio despliegue (server → Route Handlers / fetch interno). */
export function getInternalAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const v = process.env.VERCEL_URL?.trim()
  if (v) return `https://${v.replace(/^https?:\/\//, "")}`
  const port = process.env.PORT ?? "3000"
  return `http://127.0.0.1:${port}`
}
