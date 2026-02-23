/**
 * utils/shipping.ts — Fuente Única de Verdad para costos de envío
 * BeautyHome · NODO Studio
 *
 * Importado por:
 *   - src/components/organisms/CheckoutForm.jsx  (cliente)
 *   - src/pages/api/checkout/create-preference.ts (servidor)
 *
 * Nunca hardcodear estos valores en ningún otro archivo.
 */

/** Umbral de subtotal a partir del cual el envío es gratis (ARS) */
export const FREE_SHIPPING_THRESHOLD = 50_000;

/** Costo de envío estándar cuando no aplica el beneficio (ARS) */
export const SHIPPING_COST = 5_000;

/**
 * Calcula el costo de envío según el subtotal.
 * Retorna 0 si se supera el umbral de envío gratis.
 */
export function calculateShipping(subtotal: number): number {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/**
 * Línea de item de envío lista para insertar en la preferencia de MP.
 * Solo llamar si shipping > 0.
 */
export function buildShippingLineItem(cost: number) {
    return {
        id: "SHIPPING",
        title: "Envío estándar — white glove delivery",
        quantity: 1,
        unit_price: cost,
        currency_id: "ARS",
    } as const;
}