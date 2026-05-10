import { getWaitlistEntries } from "@/app/admin/waitlist-actions"
import { WaitlistPanel } from "@/components/admin/WaitlistPanel"

export default async function ListaEsperaPage() {
  let entries: Awaited<ReturnType<typeof getWaitlistEntries>> = []
  let loadError: string | null = null
  try {
    entries = await getWaitlistEntries()
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "No se pudo cargar la lista. Ejecuta scripts/waitlist-table.sql en Supabase."
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">Lista de espera no disponible</p>
        <p className="mt-2 opacity-90">{loadError}</p>
        <p className="mt-3 text-xs">
          Crea la tabla en Supabase: SQL Editor → pega{" "}
          <code className="rounded bg-white/80 px-1">scripts/waitlist-table.sql</code>.
        </p>
      </div>
    )
  }

  return <WaitlistPanel initialEntries={entries} />
}
