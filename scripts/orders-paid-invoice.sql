-- Ejecutar en Supabase SQL Editor
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

COMMENT ON COLUMN orders.paid IS 'Pago confirmado';
COMMENT ON COLUMN orders.payment_method IS 'efectivo | transferencia | tarjeta';
COMMENT ON COLUMN orders.paid_at IS 'Marca de tiempo al marcar como pagado';
COMMENT ON COLUMN orders.invoice_number IS 'Ej. SKL-0001';
