-- Ejecutar en Supabase → SQL Editor (proyectos ya creados antes de image_urls)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE VIEW products_with_category
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.name,
  p.category_id,
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
  c.slug AS category_slug
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.active = true;
