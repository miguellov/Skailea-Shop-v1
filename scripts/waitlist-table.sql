-- ============================================
-- WAITLIST — avisar cuando el producto vuelva
-- Ejecutar en Supabase > SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products (id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_product_id ON waitlist (product_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_notified_created ON waitlist (notified, created_at DESC);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Solo inserts desde la tienda pública (clave anon)
CREATE POLICY "waitlist_anon_insert"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Backend admin: lectura/actualización/eliminación
CREATE POLICY "waitlist_service_role_all"
  ON waitlist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT INSERT ON TABLE waitlist TO anon;
GRANT ALL ON TABLE waitlist TO service_role;

-- authenticated: sin políticas = sin acceso (ajustar si usas Supabase Auth más adelante)
