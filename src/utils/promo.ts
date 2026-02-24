/**
 * utils/promo.ts — Promo Code Constants (isomorphic)
 * BeautyHome · NODO Studio
 *
 * Importado tanto desde el cliente (cart.ts, CheckoutForm)
 * como desde el servidor (create-preference.ts).
 * Sin dependencias de browser — puede correr en SSR/Edge sin problemas.
 */

/** Código de descuento aplicable en el checkout */
export const PROMO_CODE = "NODO26" as const;

/** Porcentaje de descuento que aplica el código (10 = 10%) */
export const PROMO_DISCOUNT_PCT = 10 as const;

/**
 * Calcula el monto de descuento dado un subtotal.
 * Redondea al entero más cercano para evitar centavos en ARS.
 */
export function calculatePromoDiscount(subtotal: number, code: string): number {
    if (code.trim().toUpperCase() !== PROMO_CODE) return 0;
    return Math.round(subtotal * (PROMO_DISCOUNT_PCT / 100));
}
