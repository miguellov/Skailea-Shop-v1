import { listBrands } from "@/app/admin/brand-actions"
import { listCategoriesWithCounts } from "@/app/admin/category-actions"
import { CategoriasMarcasAdmin } from "@/components/admin/CategoriasMarcasAdmin"

export const dynamic = "force-dynamic"

export default async function AdminCategoriasPage() {
  const [initialCategories, initialBrands] = await Promise.all([
    listCategoriesWithCounts(),
    listBrands(),
  ])

  return (
    <CategoriasMarcasAdmin
      initialCategories={initialCategories}
      initialBrands={initialBrands}
    />
  )
}
