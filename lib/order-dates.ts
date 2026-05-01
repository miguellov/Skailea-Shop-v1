/** Límites del día calendario en America/Santo_Domingo (AST, −04:00 fijo). */
export function getDayStartEndSantoDomingo(reference = new Date()): {
  startIso: string
  endIso: string
} {
  const tz = "America/Santo_Domingo"
  const dateKey = reference.toLocaleString("sv-SE", { timeZone: tz }).slice(0, 10)
  const start = new Date(`${dateKey}T00:00:00-04:00`)
  const end = new Date(`${dateKey}T23:59:59.999-04:00`)
  return { startIso: start.toISOString(), endIso: end.toISOString() }
}
