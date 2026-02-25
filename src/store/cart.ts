/**
 * Cart Store — Nanostores
 * BeautyHome · NODO Studio
 */

import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../utils/shipping";
import { PROMO_CODE, PROMO_DISCOUNT_PCT, calculatePromoDiscount } from "../utils/promo";
import { formatPrice } from "../utils/formatters";

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

/* ── Re-exports para que los consumidores no cambien sus imports ── */
export { FREE_SHIPPING_THRESHOLD, SHIPPING_COST };   // desde utils/shipping.ts
export { PROMO_CODE, PROMO_DISCOUNT_PCT };           // desde utils/promo.ts

/* ── Atoms ───────────────────────────────────────────────── */

export const cartItems = persistentAtom<CartMap>(
  "beautyhome_cart",
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

/**
 * Código promo aplicado — persistido en localStorage.
 * Sobrevive recargas de página durante la sesión de compra.
 * Se limpia en clearPromoCode() o después del pago.
 */
export const appliedPromoCode = persistentAtom<string>("@beautyhome/promo", "");

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

export const hasFreeShipping = computed(
  cartTotal,
  (total) => total >= FREE_SHIPPING_THRESHOLD,
);

export const freeShippingRemaining = computed(cartTotal, (total) =>
  Math.max(0, FREE_SHIPPING_THRESHOLD - total),
);

/** Monto del descuento por código promo (0 si no aplica) */
export const promoDiscount = computed(
  [cartTotal, appliedPromoCode],
  (total, code) => calculatePromoDiscount(total, code),
);

/** Total del carrito después del descuento promo */
export const cartTotalWithPromo = computed(
  [cartTotal, promoDiscount],
  (total, discount) => total - discount,
);

/** Formateador global — usa formatPrice de utils/formatters.ts (sin duplicación) */
export const cartTotalFormatted = computed(cartTotal, (total) =>
  formatPrice(total),
);

/* ── Actions ─────────────────────────────────────────────── */

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

export function clearCart() {
  cartItems.set({});
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}

/**
 * Aplica un código promo al carrito.
 * @returns `true` si el código es válido, `false` si no.
 */
export function applyPromoCode(code: string): boolean {
  if (code.trim().toUpperCase() === PROMO_CODE) {
    appliedPromoCode.set(PROMO_CODE);
    return true;
  }
  return false;
}

export function clearPromoCode(): void {
  appliedPromoCode.set("");
}
