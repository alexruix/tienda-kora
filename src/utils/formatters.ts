/**
 * utils/formatters.ts — Utilidades de Formateo (TypeScript)
 * BeautyHome · NODO Studio
 */

/**
 * Formatea un número como precio en la moneda especificada.
 * @param amount  — monto en la unidad mínima de la moneda (ej: ARS 1680)
 * @param currency — código ISO 4217 (default: "ARS")
 * @param locale   — locale BCP 47 (default: "en-US" → formato $1,680)
 */
export function formatPrice(
    amount: number,
    currency: string = "ARS",
    locale: string = "en-US",
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}
