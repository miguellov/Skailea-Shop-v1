/** Preferencias de contacto del cliente (nombre + WhatsApp) para reutilizar en pedidos */

const STORAGE_KEY = "skailea_shop_customer_contact_v1"

export type StoredCustomerContact = {
  name: string
  phone: string
}

export function loadCustomerContact(): StoredCustomerContact | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<StoredCustomerContact>
    const name = typeof data.name === "string" ? data.name.trim() : ""
    const phone = typeof data.phone === "string" ? data.phone.trim() : ""
    if (!name && !phone) return null
    return { name, phone }
  } catch {
    return null
  }
}

export function saveCustomerContact(contact: StoredCustomerContact): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
      })
    )
  } catch {
    /* ignore quota */
  }
}
