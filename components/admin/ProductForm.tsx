"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import type { Category, Product } from "@/lib/types"

export type ProductFormValues = {
  name: string
  category_id: string
  price: number
  price_mayor: number
  mayor_min: number
  stock: number
  image_url: string
  image_urls: string[]
}

type Props = {
  open: boolean
  onClose: () => void
  categories: Category[]
  initial: Product | null
  onSubmit: (values: ProductFormValues) => void | Promise<void>
}

type AddPhotoTab = "upload" | "url"

const MAX_PHOTOS = 5

const empty: ProductFormValues = {
  name: "",
  category_id: "",
  price: 0,
  price_mayor: 0,
  mayor_min: 1,
  stock: 0,
  image_url: "",
  image_urls: [],
}

const ACCEPT = "image/jpeg,image/png,image/webp"

function photosFromProduct(p: Product | null): string[] {
  if (!p) return []
  const raw = Array.isArray(p.image_urls) ? p.image_urls : []
  const cleaned = raw
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
  if (cleaned.length > 0) return Array.from(new Set(cleaned)).slice(0, MAX_PHOTOS)
  const one = p.image_url?.trim()
  return one ? [one] : []
}

function finalizePhotos(urls: string[]): string[] {
  return Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean))).slice(
    0,
    MAX_PHOTOS
  )
}

export function ProductForm({ open, onClose, categories, initial, onSubmit }: Props) {
  const [values, setValues] = useState<ProductFormValues>(empty)
  const [photos, setPhotos] = useState<string[]>([])
  const [addTab, setAddTab] = useState<AddPhotoTab>("upload")
  const [urlDraft, setUrlDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setValues({
        name: initial.name,
        category_id: initial.category_id ?? "",
        price: initial.price,
        price_mayor: initial.price_mayor,
        mayor_min: initial.mayor_min,
        stock: initial.stock,
        image_url: initial.image_url ?? "",
        image_urls: photosFromProduct(initial),
      })
      setPhotos(photosFromProduct(initial))
    } else {
      const first = categories[0]
      setValues({
        ...empty,
        category_id: first?.id ?? "",
      })
      setPhotos([])
    }
    setAddTab("upload")
    setUrlDraft("")
    setPendingFile(null)
    setUploadError(null)
  }, [open, initial, categories])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setLocalPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  if (!open) return null

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    setUploadError(null)
    if (!file) return
    if (photos.length >= MAX_PHOTOS) {
      setUploadError(`Máximo ${MAX_PHOTOS} fotos.`)
      return
    }
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setUploadError("Elige JPG, PNG o WebP.")
      return
    }
    setPendingFile(file)
  }

  async function confirmUpload() {
    if (!pendingFile || photos.length >= MAX_PHOTOS) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.set("file", pendingFile)
      const res = await fetch("/admin/api/upload", {
        method: "POST",
        body: fd,
      })
      const data = (await res.json()) as { secure_url?: string; error?: string }
      if (!res.ok) {
        throw new Error(data.error || "No se pudo subir la imagen")
      }
      if (!data.secure_url) {
        throw new Error("Respuesta sin URL")
      }
      setPhotos((prev) =>
        finalizePhotos([...prev, data.secure_url!])
      )
      setPendingFile(null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir")
    } finally {
      setUploading(false)
    }
  }

  function clearPendingSelection() {
    setPendingFile(null)
    setUploadError(null)
  }

  function switchAddTab(tab: AddPhotoTab) {
    setAddTab(tab)
    setPendingFile(null)
    setUploadError(null)
  }

  function addUrlPhoto() {
    const t = urlDraft.trim()
    if (!t) return
    if (photos.length >= MAX_PHOTOS) return
    if (!/^https?:\/\//i.test(t)) {
      setUploadError("La URL debe empezar por http:// o https://")
      return
    }
    setUploadError(null)
    setPhotos((prev) => finalizePhotos([...prev, t]))
    setUrlDraft("")
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.name.trim()) return
    if (!values.category_id) return
    const urls = finalizePhotos(photos)
    setSaving(true)
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        image_url: urls[0] ?? "",
        image_urls: urls,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const sorted = [...categories].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )

  const canAddMore = photos.length < MAX_PHOTOS
  const urlPreviewSafe =
    addTab === "url" &&
    urlDraft.trim() &&
    /^https?:\/\//i.test(urlDraft.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-skailea-deep/50 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[min(92vh,640px)] w-full max-w-md overflow-y-auto rounded-t-3xl border border-skailea-blush/40 bg-skailea-cream p-4 shadow-xl sm:max-h-[90vh] sm:rounded-3xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <h2
          id="product-form-title"
          className="font-serif text-xl font-bold text-skailea-deep"
        >
          {initial ? "Editar producto" : "Añadir producto"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="block text-sm font-medium text-skailea-deep">
            Nombre
            <input
              required
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-skailea-deep">
            Categoría
            <select
              required
              className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
              value={values.category_id}
              onChange={(e) =>
                setValues((v) => ({ ...v, category_id: e.target.value }))
              }
            >
              {sorted.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-skailea-deep">
              Precio (DOP)
              <input
                required
                type="number"
                min={0}
                step={1}
                className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                value={Number.isNaN(values.price) ? "" : values.price}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    price: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </label>
            <label className="block text-sm font-medium text-skailea-deep">
              Precio mayor
              <input
                required
                type="number"
                min={0}
                step={1}
                className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                value={Number.isNaN(values.price_mayor) ? "" : values.price_mayor}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    price_mayor: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-skailea-deep">
              Mín. mayor
              <input
                required
                type="number"
                min={1}
                step={1}
                className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                value={values.mayor_min}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    mayor_min: Math.max(1, parseInt(e.target.value, 10) || 1),
                  }))
                }
              />
            </label>
            <label className="block text-sm font-medium text-skailea-deep">
              Stock
              <input
                required
                type="number"
                min={0}
                step={1}
                className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                value={values.stock}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    stock: Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
              />
            </label>
          </div>

          <div className="rounded-xl border border-skailea-blush/50 bg-skailea-blush/15 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-skailea-deep">
                Fotos del producto
              </span>
              <span className="text-xs text-skailea-charcoal/65">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </div>
            <p className="mt-1 text-xs text-skailea-charcoal/65">
              La primera foto es la principal (también se guarda en{" "}
              <span className="font-medium">image_url</span>).
            </p>

            {photos.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {photos.map((src, index) => (
                  <li
                    key={`${src}-${index}`}
                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-skailea-blush/50 bg-skailea-cream"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="80px"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      disabled={saving || uploading}
                      className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-skailea-deep/85 text-xs font-bold text-skailea-cream shadow hover:bg-skailea-deep disabled:opacity-50"
                      aria-label={`Quitar foto ${index + 1}`}
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 rounded bg-skailea-gold/95 px-1 text-[9px] font-bold uppercase text-skailea-deep">
                        Principal
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {canAddMore && (
              <>
                <div
                  className="mt-3 flex rounded-full border border-skailea-blush/50 bg-skailea-cream p-0.5"
                  role="tablist"
                  aria-label="Añadir foto"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={addTab === "upload"}
                    onClick={() => switchAddTab("upload")}
                    disabled={uploading || saving}
                    className={`flex-1 rounded-full px-2 py-2 text-center text-xs font-semibold transition sm:text-sm ${
                      addTab === "upload"
                        ? "bg-skailea-deep text-skailea-cream shadow-sm"
                        : "text-skailea-deep hover:bg-skailea-blush/35"
                    } disabled:opacity-50`}
                  >
                    📷 Subir foto
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={addTab === "url"}
                    onClick={() => switchAddTab("url")}
                    disabled={uploading || saving}
                    className={`flex-1 rounded-full px-2 py-2 text-center text-xs font-semibold transition sm:text-sm ${
                      addTab === "url"
                        ? "bg-skailea-deep text-skailea-cream shadow-sm"
                        : "text-skailea-deep hover:bg-skailea-blush/35"
                    } disabled:opacity-50`}
                  >
                    🔗 Pegar URL
                  </button>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  onChange={onFileChosen}
                />

                {addTab === "upload" && (
                  <div className="mt-2">
                    <p className="text-xs text-skailea-charcoal/70">
                      Sube JPG, PNG o WebP. Se añade a la galería al confirmar.
                    </p>
                    {localPreviewUrl && (
                      <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-xl border border-skailea-blush/40 bg-skailea-cream">
                        <Image
                          src={localPreviewUrl}
                          alt="Vista previa"
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading || saving}
                        className="rounded-full bg-skailea-deep px-4 py-2.5 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
                      >
                        Elegir archivo
                      </button>
                      {pendingFile && !uploading && (
                        <>
                          <button
                            type="button"
                            onClick={() => void confirmUpload()}
                            disabled={saving}
                            className="rounded-full bg-skailea-rose px-4 py-2.5 text-sm font-semibold text-skailea-cream hover:brightness-105 disabled:opacity-50"
                          >
                            Subir y añadir
                          </button>
                          <button
                            type="button"
                            onClick={clearPendingSelection}
                            disabled={saving}
                            className="rounded-full border border-skailea-deep/25 px-4 py-2.5 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/40 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {addTab === "url" && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-skailea-deep">
                      URL de imagen
                      <input
                        type="text"
                        inputMode="url"
                        autoComplete="off"
                        placeholder="https://…"
                        className="mt-1 w-full rounded-xl border border-skailea-blush/60 bg-white px-3 py-2 text-skailea-deep outline-none focus:ring-2 focus:ring-skailea-gold/60"
                        value={urlDraft}
                        onChange={(e) => setUrlDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addUrlPhoto()
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={addUrlPhoto}
                      disabled={saving || !urlDraft.trim()}
                      className="mt-2 rounded-full bg-skailea-rose px-4 py-2 text-sm font-semibold text-skailea-cream hover:brightness-105 disabled:opacity-50"
                    >
                      Añadir foto
                    </button>
                    {urlPreviewSafe && (
                      <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-xl border border-skailea-blush/40 bg-skailea-cream">
                        <Image
                          src={urlDraft.trim()}
                          alt="Vista previa"
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {uploading && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-skailea-rose">Subiendo…</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-skailea-blush/50">
                  <div className="h-full w-1/3 rounded-full bg-skailea-gold animate-upload-indeterminate" />
                </div>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-skailea-rose" role="alert">
                {uploadError}
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploading}
              className="rounded-full border border-skailea-deep/20 px-5 py-2.5 text-sm font-medium text-skailea-deep hover:bg-skailea-blush/30 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-full bg-skailea-deep px-5 py-2.5 text-sm font-semibold text-skailea-cream hover:opacity-95 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
