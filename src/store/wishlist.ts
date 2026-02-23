/**
 * Wishlist Store — Nanostores
 * BeautyHome · NODO Studio
 *
 * Persiste los IDs de productos en localStorage.
 * Mismo patrón que cart.ts para consistencia.
 */

import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

// ── Types ────────────────────────────────────────────────────────────────────

export type WishlistMap = Record<string, true>;

// ── Atoms ────────────────────────────────────────────────────────────────────

/**
 * Single source of truth: mapa de IDs wishlisted.
 * { "product-id": true }
 * Solo guardamos IDs — los datos del producto vienen de las Content Collections.
 */
export const wishlistItems = persistentAtom<WishlistMap>(
  "beautyhome_wishlist",
  {},
  {
    encode: JSON.stringify,
    decode: (raw: string): WishlistMap => {
      try {
        const parsed = JSON.parse(raw);
        // Sanitizar: solo keys que sean strings, valores true
        const clean: WishlistMap = {};
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof key === "string" && val === true) {
            clean[key] = true;
          }
        }
        return clean;
      } catch {
        return {};
      }
    },
  }
);

// ── Computed ─────────────────────────────────────────────────────────────────

export const wishlistCount = computed(
  wishlistItems,
  (items) => Object.keys(items).length
);

// ── Actions ──────────────────────────────────────────────────────────────────

export function toggleWishlistItem(id: string): void {
  const current = wishlistItems.get();
  if (current[id]) {
    const { [id]: _, ...rest } = current;
    wishlistItems.set(rest);
  } else {
    wishlistItems.set({ ...current, [id]: true });
  }
}

export function removeWishlistItem(id: string): void {
  const { [id]: _, ...rest } = wishlistItems.get();
  wishlistItems.set(rest);
}

export function isWishlisted(id: string): boolean {
  return !!wishlistItems.get()[id];
}

export function clearWishlist(): void {
  wishlistItems.set({});
}