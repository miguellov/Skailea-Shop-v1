-- Ejecutar en Supabase → SQL Editor (después de crear la app si aún no existe brands)

CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read brands" ON brands;
CREATE POLICY "Public read brands" ON brands FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Vista pública del catálogo: categoría + marca
CREATE OR REPLACE VIEW products_with_category
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.name,
  p.category_id,
  p.brand_id,
  p.price,
  p.price_mayor,
  p.mayor_min,
  p.image_url,
  p.image_urls,
  p.stock,
  p.active,
  p.created_at,
  p.updated_at,
  c.name AS category_name,
  c.slug AS category_slug,
  b.name AS brand_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN brands b ON b.id = p.brand_id
WHERE p.active = true;
