/** Preferencias de contacto del cliente para reutilizar en pedidos */

const STORAGE_KEY = "skailea_shop_customer_contact_v2"

export type StoredCustomerContact = {
  name: string
  phone: string
  street?: string
  citySector?: string
  province?: string
}

const LEGACY_KEY = "skailea_shop_customer_contact_v1"

export function loadCustomerContact(): StoredCustomerContact | null {
  if (typeof window === "undefined") return null
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<StoredCustomerContact>
    const name = typeof data.name === "string" ? data.name.trim() : ""
    const phone = typeof data.phone === "string" ? data.phone.trim() : ""
    const street = typeof data.street === "string" ? data.street.trim() : ""
    const citySector =
      typeof data.citySector === "string" ? data.citySector.trim() : ""
    const province =
      typeof data.province === "string" ? data.province.trim() : ""
    if (!name && !phone) return null
    return { name, phone, street, citySector, province }
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
        street: contact.street?.trim() ?? "",
        citySector: contact.citySector?.trim() ?? "",
        province: contact.province?.trim() ?? "",
      })
    )
  } catch {
    /* ignore quota */
  }
}
