/**
 * WishlistGrid Organism — React Island
 * KORA · NODO Studio
 *
 * Recibe todos los productos desde Astro (server-rendered).
 * Filtra por los IDs persistidos en el atom de wishlist.
 * Nunca hace fetch — los precios vienen validados desde Content Collections.
 */

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  wishlistItems,
  wishlistCount,
  removeWishlistItem,
  clearWishlist,
} from "../../store/wishlist.ts";
import { formatCurrency } from "../../utils/formatters.ts";
import { WishlistContent } from "../../data/wishlistContent";

// ── Sub-components ────────────────────────────────────────────────────────────

function WishlistCard({ product, onRemove, onAddToCart, animIndex }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = useCallback(async () => {
    if (adding) return;
    setAdding(true);

    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: { id: product.id },
      })
    );

    // Feedback visual
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }, 400);
  }, [adding, product.id]);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article
      className="group bg-white rounded-f2-lg overflow-hidden shadow-f2-rest hover:shadow-f2-hover transition-all duration-300 ease-fluent hover:-translate-y-0.5 animate-[slideUp_0.45s_cubic-bezier(0.33,1,0.68,1)_both]"
      style={{ animationDelay: `${animIndex * 65}ms` }}
    >
      {/* Image */}
      <a
        href={`/product/${product.id}`}
        className="block relative overflow-hidden bg-sand-100 aspect-4/5"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="w-full h-full transition-transform duration-700 ease-fluent group-hover:scale-[1.04]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 160 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-24 text-sand-200"
              >
                <rect width="160" height="200" fill="currentColor" />
                <rect x="20" y="100" width="120" height="60" rx="8" fill="#CEC5B5" />
                <rect x="24" y="88" width="112" height="26" rx="6" fill="#B5A896" />
                <rect x="16" y="92" width="128" height="18" rx="5" fill="#CEC5B5" />
                <rect x="36" y="160" width="18" height="24" rx="4" fill="#B5A896" />
                <rect x="106" y="160" width="18" height="24" rx="4" fill="#B5A896" />
              </svg>
            </div>
          )}
        </div>

        {/* Badges — incluyendo price-drop si bajó desde originalPrice */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.originalPrice && product.price < product.originalPrice && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-600 text-white px-2 py-1 rounded-full">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              Bajó {formatCurrency(product.originalPrice - product.price)}
            </span>
          )}
          {discount && product.badges?.includes("sale") && (
            <span className="badge badge-sale">−{discount}%</span>
          )}
          {product.badges?.includes("new") && (
            <span className="badge badge-new">Nuevo</span>
          )}
          {product.badges?.includes("limited") && (
            <span className="badge badge-limited">Últimas unidades</span>
          )}
        </div>

        {/* Remove button - siempre visible en mobile */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(product.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 flex items-center justify-center text-sand-900/50 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 transition-all duration-200 hover:text-watermelon hover:border-watermelon/30 hover:bg-white z-10"
          aria-label={`${WishlistContent.card.remove} ${product.name}`}
          title={WishlistContent.card.remove}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </a>

      {/* Info */}
      <div className="p-4 pt-4 pb-5">
        <a
          href={`/product/${product.id}`}
          className="block no-underline text-inherit mb-3 group/link"
        >
          <p className="text-[11px] tracking-widest uppercase text-sand-900/40 mb-1.5 font-sans">
            {product.category}
          </p>
          <h3 className="text-[15px] font-display font-medium text-sand-900 leading-snug transition-colors duration-150 group-hover/link:text-petrol">
            {product.name}
          </h3>
        </a>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[17px] font-medium text-petrol font-sans">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[13px] text-sand-900/40 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] text-sand-900/50 mb-4">
            <span className="text-gold-400">★</span>
            <span>{product.rating}</span>
            <span className="text-sand-200">·</span>
            <span>{product.reviewCount} {WishlistContent.card.reviews}</span>
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full h-10 rounded-f2-md font-sans text-[12px] tracking-[0.07em] uppercase font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition-all duration-200 disabled:cursor-not-allowed ${
            added
              ? "bg-green-600 text-white"
              : "bg-petrol text-white hover:bg-petrol/90 active:scale-[0.98]"
          }`}
          aria-label={`Añadir ${product.name} al carrito`}
        >
          {added ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {WishlistContent.card.added}
            </>
          ) : adding ? (
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {WishlistContent.card.addToCart}
            </>
          )}
        </button>
      </div>
    </article>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 px-6 text-center animate-[fadeUp_0.5s_cubic-bezier(0.33,1,0.68,1)_both]">
      {/* Decorative icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-sand-200"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <span className="absolute -top-1 -right-1 text-[18px]">✦</span>
      </div>

      <p className="font-sans text-[11px] tracking-[0.18em] uppercase text-sand-900/40 mb-3">
        {WishlistContent.empty.eyebrow}
      </p>
      <h2 className="font-display text-[clamp(28px,4vw,38px)] font-light text-petrol leading-[1.1] mb-4">
        {WishlistContent.empty.title}
      </h2>
      <p className="font-sans text-[15px] text-sand-900/50 max-w-[340px] leading-relaxed mb-10">
        {WishlistContent.empty.description}
      </p>

      <a
        href="/collections"
        className="f2-button-primary inline-flex items-center gap-2 px-7 py-3 text-[12px] tracking-[0.08em] uppercase no-underline"
      >
        {WishlistContent.empty.cta}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="5" y1="12" x2="19" y2="12" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WishlistGrid({ products = [] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [shareState, setShareState] = useState("idle"); // idle | copied | error
  const [clearConfirm, setClearConfirm] = useState(false);

  const wishlistMap = useStore(wishlistItems);
  const count = useStore(wishlistCount);

  // Filtramos los productos que están en la wishlist
  const wishlisted = products.filter((p) => !!wishlistMap[p.id]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Share wishlist — Web Share API con fallback a clipboard
  const handleShare = useCallback(async () => {
    const ids = Object.keys(wishlistMap);
    if (!ids.length) return;

    const url = `${window.location.origin}/wishlist?items=${ids.join(",")}`;
    const shareData = {
      title: WishlistContent.share.title,
      text: WishlistContent.share.text
        .replace("{count}", count.toString())
        .replace("{unit}", count === 1 ? "pieza" : "piezas"),
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2500);
      }
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }, [wishlistMap, count]);

  const handleClear = useCallback(() => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    clearWishlist();
    setClearConfirm(false);
  }, [clearConfirm]);

  // SSR guard
  if (!isMounted) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-20 flex justify-center">
        <div className="w-6 h-6 border-2 border-sand-200 border-t-petrol rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-10 lg:py-14">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-sand-200">
        <div>
          <p className="font-sans text-[11px] tracking-[0.18em] uppercase text-sand-900/40 mb-2">
            {WishlistContent.header.eyebrow}
          </p>
          <h1 className="font-display text-[clamp(36px,5vw,52px)] font-light text-petrol leading-none mb-2">
            {WishlistContent.header.title}
          </h1>
          {count > 0 && (
            <p className="font-sans text-[14px] text-sand-900/50">
              {count} {count === 1 ? WishlistContent.header.countSingular : WishlistContent.header.countPlural}
            </p>
          )}
        </div>

        {/* Actions */}
        {count > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 font-sans text-[12px] tracking-[0.07em] uppercase text-sand-900/60 border border-sand-200 rounded-f2-md px-4 py-2.5 bg-white hover:border-sand-900/30 hover:text-sand-900 transition-all duration-200 cursor-pointer"
              aria-label="Share wishlist"
            >
              {shareState === "copied" ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {WishlistContent.actions.shareSuccess}
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {WishlistContent.actions.share}
                </>
              )}
            </button>

            {/* Add all to cart */}
            <button
              onClick={() =>
                wishlisted.forEach((p) =>
                  window.dispatchEvent(
                    new CustomEvent("cart:add", { detail: { id: p.id } })
                  )
                )
              }
              className="f2-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-[12px] tracking-[0.07em] uppercase border-none cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {WishlistContent.actions.addAll}
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className={`font-sans text-[12px] tracking-[0.07em] uppercase px-4 py-2.5 rounded-f2-md border transition-all duration-200 cursor-pointer ${
                clearConfirm
                  ? "border-watermelon text-watermelon bg-watermelon/5"
                  : "border-sand-200 text-sand-900/40 bg-transparent hover:border-sand-900/30 hover:text-sand-900/60"
              }`}
              aria-label={clearConfirm ? WishlistContent.actions.clearConfirm : WishlistContent.actions.clear}
            >
              {clearConfirm ? WishlistContent.actions.clearConfirm : WishlistContent.actions.clear}
            </button>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {count === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-4 lg:gap-6">
            {wishlisted.map((product, index) => (
              <WishlistCard
                key={product.id}
                product={product}
                animIndex={index}
                onRemove={removeWishlistItem}
                onAddToCart={() =>
                  window.dispatchEvent(
                    new CustomEvent("cart:add", { detail: { id: product.id } })
                  )
                }
              />
            ))}
          </div>

          {/* Subtle prompt to keep browsing */}
          <div className="mt-16 pt-10 border-t border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-display text-[22px] font-light text-petrol/50 italic">
              {WishlistContent.footer.title}
            </p>
            <a
              href="/collections"
              className="inline-flex items-center gap-2 font-sans text-[12px] tracking-[0.07em] uppercase text-sand-900/60 hover:text-petrol transition-colors duration-150 no-underline group"
            >
              {WishlistContent.footer.cta}
              <svg
                className="transition-transform duration-200 group-hover:translate-x-1"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </>
      )}
    </div>
  );
}