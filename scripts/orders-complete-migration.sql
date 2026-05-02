-- =====================================================================
-- Migración completa tabla `orders`: columnas + RLS (ejecutar en Supabase)
-- =====================================================================

-- Columnas usadas por la app (idempotente)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'envio';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- RLS: políticas anteriores
DROP POLICY IF EXISTS "anon puede crear pedidos" ON orders;
DROP POLICY IF EXISTS "service role gestiona pedidos" ON orders;
DROP POLICY IF EXISTS "Solo admin puede ver pedidos" ON orders;
DROP POLICY IF EXISTS "insertar pedidos" ON orders;
DROP POLICY IF EXISTS "admin gestiona pedidos" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Cualquier rol con permiso INSERT puede crear filas (server action anon o cliente)
CREATE POLICY "insertar pedidos"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Service role: gestión completa — FOR ALL incluye SELECT, INSERT, UPDATE y DELETE
CREATE POLICY "admin gestiona pedidos"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
