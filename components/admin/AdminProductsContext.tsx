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
import type { Brand, Category, Product } from "@/lib/types"
import {
  createProductAction,
  deleteProductAction,
  getAdminBrands,
  getAdminCategories,
  getAdminProducts,
  toggleProductStockAction,
  updateProductAction,
  type ProductUpsertInput,
} from "@/app/admin/product-actions"

type AdminProductsContextValue = {
  products: Product[]
  categories: Category[]
  brands: Brand[]
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
  brands: Brand[]
}> {
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminBrands(),
  ])
  return { products, categories, brands }
}

export function AdminProductsProvider({
  children,
  initialProducts,
  initialCategories,
  initialBrands,
}: {
  children: ReactNode
  initialProducts: Product[]
  initialCategories: Category[]
  initialBrands: Brand[]
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [brands, setBrands] = useState<Brand[]>(initialBrands)

  useEffect(() => {
    setProducts(initialProducts)
    setCategories(initialCategories)
    setBrands(initialBrands)
  }, [initialProducts, initialCategories, initialBrands])

  const refresh = useCallback(async () => {
    const { products: p, categories: c, brands: b } = await syncFromServer()
    setProducts(p)
    setCategories(c)
    setBrands(b)
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
      brands,
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
      brands,
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
