import { DashboardHome } from "@/components/admin/DashboardHome"
import { getDashboardOrderStats } from "@/app/admin/order-actions"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const orderStats = await getDashboardOrderStats()
  return <DashboardHome orderStats={orderStats} />
}
