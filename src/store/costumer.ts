/**
 * store/customer.ts — Customer Info Store
 * BeautyHome · NODO Studio
 *
 * Persiste los datos del comprador en localStorage para que
 * no se pierdan al navegar entre pasos, refrescar, o si el pago falla.
 *
 * Se usa en CheckoutForm.jsx para pre-llenar y auto-guardar el formulario.
 * El campo `email` puede usarse en Wishlist, newsletter, etc.
 */

import { persistentAtom } from "@nanostores/persistent";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CustomerInfo {
    name: string;
    surname: string;
    email: string;
    phone: string;
    dni: string;
}

const EMPTY_CUSTOMER: CustomerInfo = {
    name: "",
    surname: "",
    email: "",
    phone: "",
    dni: "",
};

// ── Atom ──────────────────────────────────────────────────────────────────────

export const customerInfo = persistentAtom<CustomerInfo>(
    "beautyhome_customer",
    EMPTY_CUSTOMER,
    {
        encode: JSON.stringify,
        decode: (raw: string): CustomerInfo => {
            try {
                const parsed = JSON.parse(raw);

                // Sanitizar: solo guardamos strings, nunca datos inesperados
                return {
                    name: typeof parsed.name === "string" ? parsed.name : "",
                    surname: typeof parsed.surname === "string" ? parsed.surname : "",
                    email: typeof parsed.email === "string" ? parsed.email : "",
                    phone: typeof parsed.phone === "string" ? parsed.phone : "",
                    dni: typeof parsed.dni === "string" ? parsed.dni : "",
                };
            } catch {
                return EMPTY_CUSTOMER;
            }
        },
    }
);

// ── Actions ───────────────────────────────────────────────────────────────────

export function updateCustomerField(
    field: keyof CustomerInfo,
    value: string
): void {
    customerInfo.set({ ...customerInfo.get(), [field]: value });
}

/**
 * Limpia los datos del comprador.
 * Llamar después de un pago exitoso para no pre-llenar con datos viejos
 * si el comprador cierra sesión o paga por otra persona.
 *
 * Nota: NO borrar en failure/pending — el usuario quiere reintentar con los mismos datos.
 */
export function clearCustomerInfo(): void {
    customerInfo.set(EMPTY_CUSTOMER);
}