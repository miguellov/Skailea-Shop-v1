import { getDayStartEndSantoDomingo } from "@/lib/order-dates"

export type ReportPeriod = "today" | "week" | "month" | "year"

/** YYYY-MM-DD en calendario America/Santo_Domingo */
export function ymdSantoDomingo(d = new Date()): string {
  return d.toLocaleString("sv-SE", { timeZone: "America/Santo_Domingo" }).slice(0, 10)
}

function ymdAddDays(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const local = new Date(
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T12:00:00-04:00`
  )
  local.setDate(local.getDate() + deltaDays)
  return local.toLocaleString("sv-SE", { timeZone: "America/Santo_Domingo" }).slice(0, 10)
}

function isoStartYmd(ymd: string): string {
  return new Date(`${ymd}T00:00:00-04:00`).toISOString()
}

function isoEndYmd(ymd: string): string {
  return new Date(`${ymd}T23:59:59.999-04:00`).toISOString()
}

/** Inicio y fin ISO del período seleccionado (AST). */
export function getPeriodBounds(
  period: ReportPeriod,
  reference = new Date()
): { startIso: string; endIso: string; label: string } {
  const todayYmd = ymdSantoDomingo(reference)

  if (period === "today") {
    const { startIso, endIso } = getDayStartEndSantoDomingo(reference)
    return { startIso, endIso, label: "Hoy" }
  }

  if (period === "week") {
    const startYmd = ymdAddDays(todayYmd, -6)
    return {
      startIso: isoStartYmd(startYmd),
      endIso: isoEndYmd(todayYmd),
      label: "Esta semana (7 días)",
    }
  }

  if (period === "month") {
    const [y, mo] = todayYmd.split("-").map(Number)
    const lastDay = new Date(y, mo, 0).getDate()
    const startYmd = `${y}-${String(mo).padStart(2, "0")}-01`
    const endYmd = `${y}-${String(mo).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    return {
      startIso: isoStartYmd(startYmd),
      endIso: isoEndYmd(endYmd),
      label: "Este mes",
    }
  }

  const y = Number(todayYmd.slice(0, 4))
  const startYmd = `${y}-01-01`
  const endYmd = `${y}-12-31`
  return {
    startIso: isoStartYmd(startYmd),
    endIso: isoEndYmd(endYmd),
    label: "Este año",
  }
}

/** Últimos 7 días calendario SD para la gráfica (siempre rolling). */
export function getChartSevenDays(reference = new Date()) {
  const todayYmd = ymdSantoDomingo(reference)
  return Array.from({ length: 7 }, (_, i) => {
    const ymd = ymdAddDays(todayYmd, -6 + i)
    const label = new Date(`${ymd}T12:00:00-04:00`).toLocaleDateString("es-DO", {
      weekday: "short",
    })
    return {
      ymd,
      startIso: isoStartYmd(ymd),
      endIso: isoEndYmd(ymd),
      label: label.charAt(0).toUpperCase() + label.slice(1),
    }
  })
}
