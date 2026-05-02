-- Ejecutar en Supabase SQL Editor después de crear la tabla orders y columnas.
-- Requiere NEXT_PUBLIC_SUPABASE_ANON_KEY en el cliente / createPublicServerClient.

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Evitar duplicados si se vuelve a ejecutar el script
DROP POLICY IF EXISTS "anon puede crear pedidos" ON orders;
DROP POLICY IF EXISTS "service role gestiona pedidos" ON orders;

-- Permitir que anon pueda crear pedidos (tienda pública → submitStoreOrder)
CREATE POLICY "anon puede crear pedidos"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Solo service role puede ver y modificar pedidos (el panel admin usa service role)
CREATE POLICY "service role gestiona pedidos"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
