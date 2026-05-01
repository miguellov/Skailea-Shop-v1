import type { ReactNode } from "react"
import { AdminAuthGate } from "@/components/admin/AdminAuthGate"

export const dynamic = "force-dynamic"

import { AdminProductsProvider } from "@/components/admin/AdminProductsContext"
import { AdminShell } from "@/components/admin/AdminShell"
import {
  fetchAllCategoriesAdmin,
  fetchAllProductsAdmin,
} from "@/lib/supabase-admin-queries"
import { getNewOrdersCount } from "@/app/admin/order-actions"

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [initialProducts, initialCategories, newOrdersCount] = await Promise.all([
    fetchAllProductsAdmin(),
    fetchAllCategoriesAdmin(),
    getNewOrdersCount(),
  ])

  return (
    <AdminAuthGate>
      <AdminProductsProvider
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      >
        <AdminShell newOrdersCount={newOrdersCount}>{children}</AdminShell>
      </AdminProductsProvider>
    </AdminAuthGate>
  )
}
