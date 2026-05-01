import type { ReactNode } from "react"
import { AdminAuthGate } from "@/components/admin/AdminAuthGate"

export const dynamic = "force-dynamic"

import { AdminProductsProvider } from "@/components/admin/AdminProductsContext"
import { AdminShell } from "@/components/admin/AdminShell"
import {
  fetchAllBrandsAdmin,
  fetchAllCategoriesAdmin,
  fetchAllProductsAdmin,
} from "@/lib/supabase-admin-queries"
import { getNewOrdersCount } from "@/app/admin/order-actions"

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [initialProducts, initialCategories, initialBrands, newOrdersCount] =
    await Promise.all([
      fetchAllProductsAdmin(),
      fetchAllCategoriesAdmin(),
      fetchAllBrandsAdmin(),
      getNewOrdersCount(),
    ])

  return (
    <AdminAuthGate>
      <AdminProductsProvider
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialBrands={initialBrands}
      >
        <AdminShell newOrdersCount={newOrdersCount}>{children}</AdminShell>
      </AdminProductsProvider>
    </AdminAuthGate>
  )
}
