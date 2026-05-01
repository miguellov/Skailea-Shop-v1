/**
 * PayPal en el carrito (estructura lista para activar después):
 * 1. Añade `NEXT_PUBLIC_PAYPAL_CLIENT_ID` en `.env.local`
 * 2. Cambia `PAYPAL_BUTTON_DISABLED` a `false` e integra el SDK en el handler del botón
 */
export const PAYPAL_BUTTON_DISABLED = true

export const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""
