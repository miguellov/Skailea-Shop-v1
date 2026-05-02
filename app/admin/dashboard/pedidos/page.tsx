import { OrdersPanel } from "@/components/admin/OrdersPanel"
import { getOrders } from "@/app/admin/order-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPedidosPage() {
  const orders = await getOrders()
  return <OrdersPanel initialOrders={orders} />
}
