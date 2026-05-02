-- Ejecutar en Supabase SQL Editor si aún no existen las columnas
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_address TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
