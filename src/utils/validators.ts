/**
 * utils/validators.ts — Validadores compartidos
 * BeautyHome · NODO Studio
 *
 * Retornan string con el mensaje de error (en español),
 * o undefined si el valor es válido.
 *
 * Patrón: validator(value) → string | undefined
 */

/**
 * Valida email básico (RFC 5322 simplificado).
 * No usa una regex de 200 chars — detecta los errores comunes del usuario.
 */
export function validateEmail(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return "El email es requerido";
    if (!trimmed.includes("@")) return "Falta el @";
    const [local, domain] = trimmed.split("@");
    if (!local) return "Falta el usuario antes del @";
    if (!domain || !domain.includes(".")) return "El dominio no es válido";
    if (domain.endsWith(".")) return "El dominio no puede terminar con punto";
    return undefined;
}

/**
 * Valida DNI argentino: 7 u 8 dígitos, acepta puntos como separadores.
 */
export function validateDNI(value: string): string | undefined {
    if (!value) return undefined; // Campo opcional
    const digits = value.replace(/\./g, "").replace(/\s/g, "");
    if (!/^\d{7,8}$/.test(digits)) return "Ingresá un DNI válido (7-8 dígitos)";
    return undefined;
}

/**
 * Valida teléfono argentino.
 * Acepta: 11 1234-5678 / +54 9 11 1234 5678 / 011-1234-5678
 */
export function validatePhone(value: string): string | undefined {
    if (!value) return undefined; // Campo opcional
    const digits = value.replace(/[\s\-\+\(\)]/g, "");
    if (!/^\d{8,13}$/.test(digits)) return "Ingresá un teléfono válido";
    return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
    if (!value.trim()) return `${label} es requerido`;
    return undefined;
}

/**
 * Ejecuta un array de validadores y retorna el primer error encontrado.
 * Útil para combinar required + format en un solo campo.
 */
export function runValidators(
    value: string,
    ...validators: Array<(v: string) => string | undefined>
): string | undefined {
    for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
    }
    return undefined;
}