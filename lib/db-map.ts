import type { Category, Product, ProductPublic } from "@/lib/types"

type Row = Record<string, unknown>

function parseTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
}

export function mapCategory(row: Row): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    sort_order:
      row.sort_order == null ? undefined : Number(row.sort_order),
    created_at:
      row.created_at == null ? undefined : String(row.created_at),
  }
}

export function mapProduct(row: Row): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    category_id: row.category_id == null ? null : String(row.category_id),
    price: Number(row.price),
    price_mayor: Number(row.price_mayor),
    mayor_min: Number(row.mayor_min),
    image_url: row.image_url == null ? null : String(row.image_url),
    image_urls: parseTextArray(row.image_urls),
    stock: Number(row.stock),
    active: Boolean(row.active),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export function mapProductPublic(row: Row): ProductPublic {
  return {
    id: String(row.id),
    name: String(row.name),
    category_id: row.category_id == null ? null : String(row.category_id),
    price: Number(row.price),
    price_mayor: Number(row.price_mayor),
    mayor_min: Number(row.mayor_min),
    image_url: row.image_url == null ? null : String(row.image_url),
    image_urls: parseTextArray(row.image_urls),
    stock: Number(row.stock),
    active: true,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    category_name:
      row.category_name == null ? null : String(row.category_name),
    category_slug:
      row.category_slug == null ? null : String(row.category_slug),
  }
}
