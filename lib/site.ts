/** Datos de contacto y marca — tienda pública */
/** URL pública de la tienda (admin “Ver tienda”, OG, sitemap) */
export const SITE_PUBLIC_URL = "https://skaileashop.com"

export const SITE_NAME = "Skailea Shop"
export const SITE_TAGLINE = "Tu Aroma Deja Huella"
export const SITE_LOCATION = "Sosúa, Puerto Plata, República Dominicana"
export const SITE_INSTAGRAM_URL = "https://www.instagram.com/skailea_shop"
export const SITE_INSTAGRAM_HANDLE = "@skailea_shop"
export const SITE_EMAIL = "skaileashop@gmail.com"
export const SITE_PHONE_DISPLAY = "+1 (829) 694-9181"
/** Sin +: wa.me / WhatsApp API */
export const SITE_WHATSAPP_DIGITS_DEFAULT = "18296949181"

export const WA_FLOAT_MESSAGE =
  "Hola Skailea Shop! 👋 Tengo una consulta sobre sus productos 🛍️"

/** Mensaje para avisos desde la página coming-soon (incluye número si el usuario lo escribe) */
export function waComingSoonNotifyMessage(userPhoneDigits?: string): string {
  const extra =
    userPhoneDigits &&
    userPhoneDigits.replace(/\D/g, "").length >= 8
      ? ` Mi WhatsApp: ${userPhoneDigits.replace(/\D/g, "")}`
      : ""
  return `¡Hola Skailea Shop! Quiero que me avisen cuando abran la tienda.${extra} 🛍️`
}

/** NEXT_PUBLIC_WHATSAPP_NUMBER en .env sobreescribe el número por defecto */
export function getWhatsAppDigitsFromEnv(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  if (fromEnv) return fromEnv.replace(/\D/g, "")
  return SITE_WHATSAPP_DIGITS_DEFAULT
}
