/**
 * Formatea un número como moneda ARS ($3.482,50). 
 * Según Regla Global 7 de KORA.
 */
export function formatCurrency(
    amount: number,
    currency: string = "ARS",
    locale: string = "es-AR",
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

