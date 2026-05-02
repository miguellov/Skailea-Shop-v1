-- Ejecutar en Supabase SQL Editor
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'envio';

COMMENT ON COLUMN orders.delivery_type IS 'envio | retiro';
