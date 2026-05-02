/** Une calle, ciudad/sector y provincia para guardar y mostrar */

export type DeliveryAddressParts = {
  street: string
  citySector: string
  province: string
}

export function formatDeliveryAddressMultiline(parts: DeliveryAddressParts): string {
  const lines = [
    parts.street.trim(),
    parts.citySector.trim(),
    parts.province.trim(),
  ].filter(Boolean)
  return lines.join("\n")
}

/** Una sola línea para WhatsApp */
export function formatDeliveryAddressOneLine(parts: DeliveryAddressParts): string {
  return [parts.street, parts.citySector, parts.province]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ")
}
