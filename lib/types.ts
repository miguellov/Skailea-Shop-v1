export type Category = {
  id: string
  name: string
  slug: string
  sort_order?: number
  created_at?: string
}

/** Fila de `products` (admin / API con service role) */
export type Product = {
  id: string
  name: string
  category_id: string | null
  price: number
  price_mayor: number
  mayor_min: number
  image_url: string | null
  /** Galería (máx. 5 en admin); la primera URL debe coincidir con image_url */
  image_urls: string[]
  stock: number
  active: boolean
  created_at: string
  updated_at: string
}

/** Catálogo público: filas de la vista `products_with_category` */
export type ProductPublic = Omit<Product, "active"> & {
  active: true
  category_name: string | null
  category_slug: string | null
}

export type OrderStatus = "nuevo" | "preparando" | "despachado" | "entregado"

export type OrderLineItem = {
  product_id: string
  name: string
  quantity: number
  unit_price: number
  line_total: number
}

/** Fila de `orders` en Supabase */
export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  items: OrderLineItem[]
  total: number
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
}
