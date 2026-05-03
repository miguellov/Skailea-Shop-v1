export type Category = {
  id: string
  name: string
  slug: string
  sort_order?: number
  created_at?: string
}

export type Brand = {
  id: string
  name: string
  created_at?: string
}

/** Fila de `products` (admin / API con service role) */
export type Product = {
  id: string
  name: string
  category_id: string | null
  brand_id: string | null
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
  brand_name: string | null
}

export type OrderStatus =
  | "nuevo"
  | "preparando"
  | "despachado"
  | "entregado"
  | "cancelado"

/** Cómo recibe el pedido el cliente (columna `delivery_type` en Supabase) */
export type DeliveryType = "envio" | "retiro"

/** Método de pago al marcar pedido como pagado */
export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta"

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
  delivery_type: DeliveryType
  /** Dirección de envío (texto multilínea: calle, ciudad/sector, provincia) */
  delivery_address: string | null
  /** Instrucciones especiales del cliente para la entrega */
  delivery_notes: string | null
  items: OrderLineItem[]
  total: number
  status: OrderStatus
  /** Notas internas / sistema (p. ej. precio por mayor) */
  notes: string | null
  paid: boolean
  payment_method: PaymentMethod | null
  paid_at: string | null
  invoice_number: string | null
  created_at: string
  updated_at: string
}
