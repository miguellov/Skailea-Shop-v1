-- Catálogo público (clave anon): si PostgREST solo devuelve pocas filas aunque la vista
-- sea correcta con service_role, el rol `anon` necesita políticas SELECT.

-- Categorías visibles en tienda
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon USING (true);

-- Productos activos (la vista products_with_category filtra active = true; el rol debe poder leer filas que la vista proyecta)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active products" ON products;
CREATE POLICY "Public read active products" ON products FOR SELECT TO anon USING (active = true);

-- Marcas (catálogo y filtros)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read brands" ON brands;
CREATE POLICY "Public read brands" ON brands FOR SELECT TO anon USING (true);
