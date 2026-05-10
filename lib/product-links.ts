import { SITE_PUBLIC_URL } from "@/lib/site"

/** URL para compartir / abrir el modal del producto (query `p`). */
export function getProductShareUrl(productId: string): string {
  const base = SITE_PUBLIC_URL.replace(/\/$/, "")
  return `${base}/?p=${encodeURIComponent(productId)}`
}
