"use server"

export type VerifyPinResult = { ok: true } | { ok: false; error: string }

export async function verifyAdminPin(pin: string): Promise<VerifyPinResult> {
  const expected = process.env.ADMIN_PIN
  if (!expected) {
    return { ok: false, error: "ADMIN_PIN no está configurado en el servidor." }
  }
  const a = pin.trim()
  if (a.length === 0) {
    return { ok: false, error: "Ingresa el PIN." }
  }
  if (a !== expected) {
    return { ok: false, error: "PIN incorrecto." }
  }
  return { ok: true }
}
