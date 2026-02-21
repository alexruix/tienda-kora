/**
 * Cart Store — Nanostores
 * BeautyHome · NODO Studio
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// ── Types ──────────────────────────────────────────────────
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string; // Para el color (ej: "Oat Linen")
};

// ── Atoms ──────────────────────────────────────────────────

// 1. Cambio CLAVE: Usamos persistentAtom para que el carrito sobreviva a recargas.
// Lo guardamos bajo la llave 'beautyhome_cart' en el localStorage.
export const cartItems = persistentAtom<Record<string, CartItem>>(
  'beautyhome_cart',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

/** Controls cart drawer visibility */
export const isCartOpen = atom(false);

// ── Derived / Computed ─────────────────────────────────────

/** Total number of items (sum of quantities) */
export const cartCount = computed(cartItems, (items) =>
  Object.values(items).reduce((sum, item) => sum + item.quantity, 0)
);

/** Cart subtotal */
export const cartTotal = computed(cartItems, (items) =>
  Object.values(items).reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

// ── Actions ────────────────────────────────────────────────

/** Add or increment a product in the cart */
export function addCartItem(product: Omit<CartItem, 'quantity'>) {
  const current = cartItems.get();
  const existing = current[product.id];
  
  cartItems.set({
    ...current,
    [product.id]: existing
      ? { ...existing, quantity: existing.quantity + 1 }
      : { ...product, quantity: 1 },
  });

  // UX Fix: Abrimos el carrito automáticamente al añadir un producto
  isCartOpen.set(true); 
}

/** Remove an item from the cart entirely */
export function removeCartItem(id: string) {
  const current = { ...cartItems.get() };
  delete current[id];
  cartItems.set(current);
}

/** Update quantity — removes item if qty drops to 0 */
export function setCartQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    removeCartItem(id);
    return;
  }
  const current = cartItems.get();
  if (!current[id]) return;
  cartItems.set({ ...current, [id]: { ...current[id], quantity } });
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}