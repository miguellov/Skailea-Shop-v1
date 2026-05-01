import { getReportData } from "@/app/admin/report-actions"
import { ReportsDashboard } from "@/components/admin/ReportsDashboard"

export const dynamic = "force-dynamic"

export default async function AdminReportesPage() {
  const initial = await getReportData("month")
  return <ReportsDashboard initial={initial} />
}
