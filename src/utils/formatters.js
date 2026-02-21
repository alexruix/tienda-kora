/**
 * Utilidades de Formateo
 * BeautyHome · NODO Studio
 */

export function formatPrice(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 // Añadido para manejar centavos si es necesario en el futuro
  }).format(amount);
}

// Ejemplo si luego necesitas usar pesos argentinos localmente:
// formatPrice(2890, 'ARS', 'es-AR')