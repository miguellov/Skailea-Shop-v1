"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Category, Product } from "@/lib/types"
import {
  createProductAction,
  deleteProductAction,
  getAdminCategories,
  getAdminProducts,
  toggleProductStockAction,
  updateProductAction,
  type ProductUpsertInput,
} from "@/app/admin/product-actions"

type AdminProductsContextValue = {
  products: Product[]
  categories: Category[]
  addProduct: (data: ProductUpsertInput) => Promise<void>
  updateProduct: (id: string, data: ProductUpsertInput) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  toggleStockOut: (id: string) => Promise<void>
  refresh: () => Promise<void>
  stats: {
    total: number
    agotados: number
    stockBajo: number
    lowStockProducts: Product[]
  }
}

const AdminProductsContext = createContext<AdminProductsContextValue | null>(
  null
)

async function syncFromServer(): Promise<{
  products: Product[]
  categories: Category[]
}> {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ])
  return { products, categories }
}

export function AdminProductsProvider({
  children,
  initialProducts,
  initialCategories,
}: {
  children: ReactNode
  initialProducts: Product[]
  initialCategories: Category[]
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  useEffect(() => {
    setProducts(initialProducts)
    setCategories(initialCategories)
  }, [initialProducts, initialCategories])

  const refresh = useCallback(async () => {
    const { products: p, categories: c } = await syncFromServer()
    setProducts(p)
    setCategories(c)
  }, [])

  const addProduct = useCallback(
    async (data: ProductUpsertInput) => {
      await createProductAction(data)
      await refresh()
    },
    [refresh]
  )

  const updateProduct = useCallback(
    async (id: string, data: ProductUpsertInput) => {
      await updateProductAction(id, data)
      await refresh()
    },
    [refresh]
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteProductAction(id)
      await refresh()
    },
    [refresh]
  )

  const toggleStockOut = useCallback(
    async (id: string) => {
      await toggleProductStockAction(id)
      await refresh()
    },
    [refresh]
  )

  const stats = useMemo(() => {
    const total = products.length
    const agotados = products.filter((p) => p.stock === 0).length
    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock < 5
    )
    const stockBajo = lowStockProducts.length
    return { total, agotados, stockBajo, lowStockProducts }
  }, [products])

  const value = useMemo(
    () => ({
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStockOut,
      refresh,
      stats,
    }),
    [
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStockOut,
      refresh,
      stats,
    ]
  )

  return (
    <AdminProductsContext.Provider value={value}>
      {children}
    </AdminProductsContext.Provider>
  )
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductsContext)
  if (!ctx) {
    throw new Error("useAdminProducts debe usarse dentro de AdminProductsProvider")
  }
  return ctx
}
