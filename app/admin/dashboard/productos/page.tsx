"use client"

import { useState } from "react"
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm"
import { ProductList } from "@/components/admin/ProductList"
import { useAdminProducts } from "@/components/admin/AdminProductsContext"
import type { Product } from "@/lib/types"

export default function AdminProductosPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStockOut,
  } = useAdminProducts()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  async function handleSave(values: ProductFormValues) {
    const urls = Array.from(
      new Set(values.image_urls.map((u) => u.trim()).filter(Boolean))
    ).slice(0, 5)
    const image_url = urls[0] ?? null
    const payload = {
      name: values.name,
      category_id: values.category_id || null,
      price: values.price,
      price_mayor: values.price_mayor,
      mayor_min: values.mayor_min,
      stock: values.stock,
      image_url,
      image_urls: urls,
      active: true,
    }
    setBusy(true)
    try {
      if (editing) {
        await updateProduct(editing.id, payload)
      } else {
        await addProduct(payload)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar"
      window.alert(msg)
      throw e
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    setBusy(true)
    try {
      await deleteProduct(id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar"
      window.alert(msg)
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleStock(id: string) {
    setBusy(true)
    try {
      await toggleStockOut(id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar stock"
      window.alert(msg)
    } finally {
      setBusy(false)
    }
  }

  const sorted = [...products].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-skailea-deep sm:text-3xl">
            Productos
          </h1>
          <p className="mt-1 text-sm text-skailea-charcoal/80">
            Cambios guardados en Supabase. La tienda pública se actualiza al guardar.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={busy}
          className="rounded-full bg-skailea-deep px-5 py-2.5 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
        >
          Añadir producto
        </button>
      </div>

      <ProductList
        products={sorted}
        categories={categories}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleStock={handleToggleStock}
        disabled={busy}
      />

      <ProductForm
        open={formOpen}
        onClose={closeForm}
        categories={categories}
        initial={editing}
        onSubmit={handleSave}
      />
    </div>
  )
}
