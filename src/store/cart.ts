/**
 * Cart Store — Nanostores
 * BeautyHome · NODO Studio
 */

import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

/* ── Types ───────────────────────────────────────────────── */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
};

export type CartMap = Record<string, CartItem>;

export const FREE_SHIPPING_THRESHOLD = 5000;
export const PROMO_CODE = "NODO26";

/* ── Atoms ───────────────────────────────────────────────── */

// 1. Guardamos el try/catch de Claude para máxima seguridad
export const cartItems = persistentAtom<CartMap>(
  "beautyhome_cart", // Mantenemos nuestra llave original
  {},
  {
    encode: JSON.stringify,
    decode: (raw: string): CartMap => {
      try {
        return JSON.parse(raw) as CartMap;
      } catch {
        return {};
      }
    },
  },
);

export const isCartOpen = atom<boolean>(false);

/* ── Derived / Computed ──────────────────────────────────── */

export const cartCount = computed(cartItems, (items) =>
  Object.values(items).reduce((sum, item) => sum + item.quantity, 0),
);

export const cartTotal = computed(cartItems, (items) =>
  Object.values(items).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  ),
);

// NUEVO: Lógica de negocio extraída al Store (Genialidad de Claude)
export const hasFreeShipping = computed(
  cartTotal,
  (total) => total >= FREE_SHIPPING_THRESHOLD,
);

export const freeShippingRemaining = computed(cartTotal, (total) =>
  Math.max(0, FREE_SHIPPING_THRESHOLD - total),
);

// NUEVO: Formateador global
export const cartTotalFormatted = computed(cartTotal, (total) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(total),
);

/* ── Actions ─────────────────────────────────────────────── */

// Mantenemos nuestros nombres de funciones para no romper la app
export function addCartItem(
  product: Omit<CartItem, "quantity"> & { quantity?: number },
) {
  const current = cartItems.get();
  const existing = current[product.id];

  cartItems.set({
    ...current,
    [product.id]: existing
      ? { ...existing, quantity: existing.quantity + (product.quantity ?? 1) }
      : { ...product, quantity: product.quantity ?? 1 },
  });

  // MANTENEMOS ESTO: La mejora de UX de NODO
  isCartOpen.set(true);
}

export function removeCartItem(id: string) {
  const current = { ...cartItems.get() };
  delete current[id];
  cartItems.set(current);
}

export function setCartQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    removeCartItem(id);
    return;
  }
  const current = cartItems.get();
  if (!current[id]) return;
  cartItems.set({ ...current, [id]: { ...current[id], quantity } });
}

// NUEVO: Función útil para cuando se implemente el Checkout
export function clearCart() {
  cartItems.set({});
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}
