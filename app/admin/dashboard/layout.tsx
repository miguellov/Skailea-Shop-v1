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
import { getPendingWaitlistCount } from "@/app/admin/waitlist-actions"

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

  let waitlistPendingCount = 0
  try {
    waitlistPendingCount = await getPendingWaitlistCount()
  } catch (e) {
    console.error(
      "[admin/dashboard/layout] waitlist:",
      e instanceof Error ? e.message : e
    )
  }

  return (
    <AdminAuthGate>
      <AdminProductsProvider
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialBrands={initialBrands}
      >
        <AdminShell
          newOrdersCount={newOrdersCount}
          waitlistPendingCount={waitlistPendingCount}
        >
          {children}
        </AdminShell>
      </AdminProductsProvider>
    </AdminAuthGate>
  )
}
