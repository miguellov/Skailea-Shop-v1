"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
  createBrandAction,
  deleteBrandAction,
  listBrands,
  updateBrandAction,
} from "@/app/admin/brand-actions"
import {
  createCategoryAction,
  deleteCategoryAction,
  listCategoriesWithCounts,
  updateCategoryAction,
  type CategoryWithCount,
} from "@/app/admin/category-actions"
import type { Brand } from "@/lib/types"

type Tab = "categorias" | "marcas"

type Props = {
  initialCategories: CategoryWithCount[]
  initialBrands: Brand[]
}

export function CategoriasMarcasAdmin({
  initialCategories,
  initialBrands,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("categorias")
  const [categories, setCategories] =
    useState<CategoryWithCount[]>(initialCategories)
  const [brands, setBrands] = useState<Brand[]>(initialBrands)

  const [catModal, setCatModal] = useState<"new" | { edit: CategoryWithCount } | null>(
    null
  )
  const [catNameDraft, setCatNameDraft] = useState("")
  const [brandModal, setBrandModal] = useState<"new" | { edit: Brand } | null>(null)
  const [brandNameDraft, setBrandNameDraft] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  useEffect(() => {
    setBrands(initialBrands)
  }, [initialBrands])

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  async function reloadLists() {
    const [nextCats, nextBrands] = await Promise.all([
      listCategoriesWithCounts(),
      listBrands(),
    ])
    setCategories(nextCats)
    setBrands(nextBrands)
    refresh()
  }

  function openNewCategory() {
    setCatNameDraft("")
    setCatModal("new")
  }

  function openEditCategory(c: CategoryWithCount) {
    setCatNameDraft(c.name)
    setCatModal({ edit: c })
  }

  async function saveCategory() {
    if (!catModal) return
    setBusy(true)
    try {
      if (catModal === "new") {
        await createCategoryAction(catNameDraft)
      } else {
        await updateCategoryAction(catModal.edit.id, catNameDraft)
      }
      setCatModal(null)
      await reloadLists()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    } finally {
      setBusy(false)
    }
  }

  async function removeCategory(c: CategoryWithCount) {
    if (c.product_count > 0) return
    if (!window.confirm(`¿Eliminar la categoría «${c.name}»?`)) return
    setBusy(true)
    try {
      await deleteCategoryAction(c.id)
      await reloadLists()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    } finally {
      setBusy(false)
    }
  }

  function openNewBrand() {
    setBrandNameDraft("")
    setBrandModal("new")
  }

  function openEditBrand(b: Brand) {
    setBrandNameDraft(b.name)
    setBrandModal({ edit: b })
  }

  async function saveBrand() {
    if (!brandModal) return
    setBusy(true)
    try {
      if (brandModal === "new") {
        await createBrandAction(brandNameDraft)
      } else {
        await updateBrandAction(brandModal.edit.id, brandNameDraft)
      }
      setBrandModal(null)
      await reloadLists()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    } finally {
      setBusy(false)
    }
  }

  async function removeBrand(b: Brand) {
    if (!window.confirm(`¿Eliminar la marca «${b.name}»? Los productos quedarán sin marca.`))
      return
    setBusy(true)
    try {
      await deleteBrandAction(b.id)
      await reloadLists()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-skailea-deep sm:text-3xl">
          Categorías y marcas
        </h1>
        <p className="mt-1 text-sm text-skailea-charcoal/80">
          Organiza el catálogo. Las categorías generan URL en la tienda; las marcas son
          opcionales en cada producto.
        </p>
      </div>

      <div
        className="flex rounded-full border border-skailea-blush/50 bg-white/80 p-1 shadow-sm"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "categorias"}
          onClick={() => setTab("categorias")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            tab === "categorias"
              ? "bg-skailea-deep text-skailea-cream shadow-sm"
              : "text-skailea-deep hover:bg-skailea-blush/35"
          }`}
        >
          Categorías
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "marcas"}
          onClick={() => setTab("marcas")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            tab === "marcas"
              ? "bg-skailea-deep text-skailea-cream shadow-sm"
              : "text-skailea-deep hover:bg-skailea-blush/35"
          }`}
        >
          Marcas
        </button>
      </div>

      {tab === "categorias" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold text-skailea-deep">
              Lista de categorías
            </h2>
            <button
              type="button"
              disabled={busy}
              onClick={openNewCategory}
              className="rounded-full bg-skailea-deep px-4 py-2 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
            >
              ➕ Nueva categoría
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {categories.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-skailea-blush/60 bg-skailea-blush/15 px-4 py-8 text-center text-sm text-skailea-deep/75">
                No hay categorías. Crea la primera.
              </li>
            ) : (
              categories.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-3 rounded-2xl border border-skailea-blush/40 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-skailea-deep">{c.name}</p>
                    <p className="text-xs text-skailea-charcoal/70">
                      {c.product_count}{" "}
                      {c.product_count === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openEditCategory(c)}
                      className="rounded-full bg-skailea-gold/35 px-3 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-gold/50 disabled:opacity-50"
                    >
                      Editar nombre
                    </button>
                    <button
                      type="button"
                      disabled={busy || c.product_count > 0}
                      title={
                        c.product_count > 0
                          ? "Quita o mueve los productos antes de eliminar"
                          : undefined
                      }
                      onClick={() => void removeCategory(c)}
                      className="rounded-full border border-skailea-rose/40 px-3 py-2 text-xs font-semibold text-skailea-rose hover:bg-skailea-rose/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      )}

      {tab === "marcas" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-semibold text-skailea-deep">
              Lista de marcas
            </h2>
            <button
              type="button"
              disabled={busy}
              onClick={openNewBrand}
              className="rounded-full bg-skailea-deep px-4 py-2 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
            >
              ➕ Nueva marca
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {brands.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-skailea-blush/60 bg-skailea-blush/15 px-4 py-8 text-center text-sm text-skailea-deep/75">
                No hay marcas. Añade marcas para asignarlas en cada producto.
              </li>
            ) : (
              brands.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-3 rounded-2xl border border-skailea-blush/40 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="font-semibold text-skailea-deep">{b.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openEditBrand(b)}
                      className="rounded-full bg-skailea-gold/35 px-3 py-2 text-xs font-semibold text-skailea-deep hover:bg-skailea-gold/50 disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeBrand(b)}
                      className="rounded-full border border-skailea-rose/40 px-3 py-2 text-xs font-semibold text-skailea-rose hover:bg-skailea-rose/10 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      )}

      {(catModal || brandModal) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-skailea-deep/50 backdrop-blur-[2px]"
            aria-label="Cerrar"
            onClick={() => {
              setCatModal(null)
              setBrandModal(null)
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-skailea-blush/40 bg-skailea-cream p-5 shadow-xl sm:rounded-3xl">
            {catModal && (
              <>
                <h3 className="font-serif text-lg font-semibold text-skailea-deep">
                  {catModal === "new" ? "Nueva categoría" : "Editar categoría"}
                </h3>
                <label className="mt-4 block text-sm font-medium text-skailea-deep">
                  Nombre
                  <input
                    className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                    value={catNameDraft}
                    onChange={(e) => setCatNameDraft(e.target.value)}
                    autoFocus
                  />
                </label>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setCatModal(null)}
                    className="rounded-full border border-skailea-deep/20 px-4 py-2 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/30"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={busy || !catNameDraft.trim()}
                    onClick={() => void saveCategory()}
                    className="rounded-full bg-skailea-deep px-4 py-2 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}
            {brandModal && (
              <>
                <h3 className="font-serif text-lg font-semibold text-skailea-deep">
                  {brandModal === "new" ? "Nueva marca" : "Editar marca"}
                </h3>
                <label className="mt-4 block text-sm font-medium text-skailea-deep">
                  Nombre
                  <input
                    className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                    value={brandNameDraft}
                    onChange={(e) => setBrandNameDraft(e.target.value)}
                    autoFocus
                  />
                </label>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setBrandModal(null)}
                    className="rounded-full border border-skailea-deep/20 px-4 py-2 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/30"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={busy || !brandNameDraft.trim()}
                    onClick={() => void saveBrand()}
                    className="rounded-full bg-skailea-deep px-4 py-2 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
