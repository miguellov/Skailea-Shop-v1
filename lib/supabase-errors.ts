/** Serializa error de PostgREST / Supabase para logs y UI */

export function formatSupabaseError(error: unknown): string {
  if (error == null) return "Error desconocido (null)"
  if (typeof error === "string") return error
  if (error instanceof Error) {
    const any = error as Error & {
      details?: string
      hint?: string
      code?: string
    }
    try {
      return JSON.stringify(
        {
          name: error.name,
          message: error.message,
          details: any.details,
          hint: any.hint,
          code: any.code,
        },
        null,
        2
      )
    } catch {
      return `${error.name}: ${error.message}`
    }
  }
  if (typeof error === "object") {
    try {
      return JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    } catch {
      return String(error)
    }
  }
  return String(error)
}
