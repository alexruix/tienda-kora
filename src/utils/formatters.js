/**
 * Utilidades de Formateo
 * BeautyHome · NODO Studio
 */

export function formatPrice(amount, currency = 'ARS', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 // Añadido para manejar centavos si es necesario en el futuro
  }).format(amount);
}
