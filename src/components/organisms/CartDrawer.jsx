/**
 * CartDrawer Organism — React Island
 * KORA · NODO Studio
 *
 * Comportamiento adaptativo:
 *   - Mobile (< lg): Bottom Sheet con swipe-to-close
 *   - Desktop (lg+): Side Drawer desde la derecha
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import CartItem from "../molecules/CartItem.jsx";
import {
  cartItems,
  isCartOpen,
  cartCount,
  addCartItem,
  FREE_SHIPPING_THRESHOLD,
  hasFreeShipping,
  freeShippingRemaining,
  cartTotalFormatted,
  cartTotal,
  cartTotalWithPromo,
  promoDiscount,
  appliedPromoCode,
  applyPromoCode,
  clearPromoCode,
  PROMO_DISCOUNT_PCT,
  removeCartItem,
  setCartQuantity,
  toggleCart,
} from "../../store/cart.ts";
import { formatPrice } from "../../utils/formatters.ts";

// ── Constantes de Swipe ───────────────────────────────────────────────────────
const SWIPE_CLOSE_THRESHOLD = 80; // px para cerrar
const SWIPE_VELOCITY_THRESHOLD = 0.5; // px/ms

export function CartDrawer({ products = [] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const itemsMap = useStore(cartItems);
  const isOpen = useStore(isCartOpen);
  const itemCount = useStore(cartCount);
  const isFreeShipping = useStore(hasFreeShipping);
  const remainingForFree = useStore(freeShippingRemaining);
  const totalStr = useStore(cartTotalFormatted);
  const subtotal = useStore(cartTotal);
  const discount = useStore(promoDiscount);
  const promoCode = useStore(appliedPromoCode);
  const totalWithPromo = useStore(cartTotalWithPromo);

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);

  // ── Swipe State ───────────────────────────────────────────────────────────
  const sheetRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const currentTranslateY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const items = Object.values(itemsMap);

  const handleApplyPromo = useCallback(() => {
    if (!promoInput.trim()) { setPromoError("Ingresá un código."); return; }
    if (applyPromoCode(promoInput.trim())) {
      setPromoError("");
    } else {
      setPromoError("Código inválido.");
    }
  }, [promoInput]);

  const handleRemovePromo = useCallback(() => {
    clearPromoCode();
    setPromoInput("");
    setPromoError("");
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Agregar items al carrito via CustomEvent
  useEffect(() => {
    const handleAddToCart = (e) => {
      const { id, variant } = e.detail;
      if (!id) return;
      const productData = products.find((p) => p.id === id);
      if (productData) {
        addCartItem({
          id: productData.id,
          name: productData.name,
          price: productData.price,
          image: productData.image ?? "",
          variant: variant || "Standard",
        });
      }
    };
    window.addEventListener("cart:add", handleAddToCart);
    return () => window.removeEventListener("cart:add", handleAddToCart);
  }, [products]);

  // Lock scroll del body cuando el drawer esté abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Swipe Handlers (Bottom Sheet) ─────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    currentTranslateY.current = 0;
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    // Solo permitir swipe hacia abajo (cerrar)
    if (diff > 0) {
      setDragOffset(diff);
    }
  }, [isMobile, isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    setIsDragging(false);
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = dragOffset / elapsed;

    if (dragOffset > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      toggleCart(); // cerrar
    }
    setDragOffset(0);
  }, [isMobile, dragOffset]);

  if (!isMounted) return null;

  const sheetStyle = isMobile && dragOffset > 0
    ? { transform: `translateY(${dragOffset}px)`, transition: "none" }
    : undefined;

  return (
    <>
      {/* Overlay / Backdrop */}
      <div
        className={`fixed inset-0 bg-petrol/20 z-2000 backdrop-blur-sm transition-all duration-380 ease-fluent ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={toggleCart}
        aria-hidden="true"
      />

      {/* ── Desktop: Side Drawer | Mobile: Bottom Sheet ── */}
      <aside
        ref={sheetRef}
        style={sheetStyle}
        className={[
          "fixed z-2001 bg-sand-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)]",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 rounded-t-[28px] h-[92dvh]",
          // Desktop: side drawer
          "lg:top-0 lg:right-0 lg:left-auto lg:w-[420px] lg:h-dvh lg:rounded-none",
          // Transition
          isMobile
            ? (isOpen ? "translate-y-0 transition-transform duration-380 ease-fluent" : "translate-y-full transition-transform duration-380 ease-fluent")
            : (isOpen ? "translate-x-0 transition-transform duration-380 ease-fluent" : "translate-x-full transition-transform duration-380 ease-fluent"),
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Mobile pill handle ── */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-sand-300 rounded-full" aria-hidden="true" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-sand-200 bg-white shrink-0 lg:rounded-none rounded-t-[28px]">
          <div>
            <h2 className="font-display text-[26px] font-light text-petrol leading-none">
              Mi Carrito
            </h2>
            <p className="font-sans text-[13px] text-sand-900/50 mt-0.5">
              {itemCount > 0
                ? `${itemCount} artículo${itemCount !== 1 ? "s" : ""}`
                : "Vacío"}
            </p>
          </div>
          <button
            onClick={toggleCart}
            className="w-9 h-9 rounded-f2-md flex items-center justify-center hover:bg-sand-100 f2-transition text-sand-900/40 hover:text-sand-900 cursor-pointer border-none bg-transparent"
            aria-label="Cerrar carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body — Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sand-400">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p className="text-[17px] font-display text-petrol/70 mb-2">Tu carrito está vacío</p>
              <p className="text-[13px] text-sand-900/40 font-sans mb-6">Explorá nuestra colección</p>
              <button
                className="f2-button-primary text-[12px]! uppercase tracking-widest"
                onClick={toggleCart}
              >
                Ver Colección
              </button>
            </div>
          ) : (
            <div>
              {/* Progress Bar — Free Shipping */}
              {!isFreeShipping && (
                <div className="bg-white rounded-f2-md py-3 px-4 mb-4 border border-sand-100">
                  <p className="font-sans text-[12px] text-sand-900/70 mb-2">
                    Agregá{" "}
                    <strong className="text-petrol">{formatPrice(remainingForFree)}</strong>{" "}
                    más para envío gratis
                  </p>
                  <div className="h-[4px] bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-petrol transition-[width] duration-800 ease-fluent"
                      style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {isFreeShipping && (
                <div className="flex items-center gap-2 text-[12px] text-petrol font-medium py-3 mb-3 bg-petrol/5 px-4 rounded-f2-md border border-petrol/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  ¡Envío gratis desbloqueado!
                </div>
              )}

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
                    onRemove={() => removeCartItem(item.id)}
                    onQtyChange={(newQty) => setCartQuantity(item.id, newQty)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Sticky Bottom */}
        {items.length > 0 && (
          <div
            className="px-5 pt-4 pb-5 border-t border-sand-200 bg-white shrink-0"
            style={{ paddingBottom: `max(1.25rem, env(safe-area-inset-bottom))` }}
          >
            {/* Promo Code */}
            <div className="mb-4 border border-sand-200 rounded-f2-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPromoOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-sand-50 hover:bg-sand-100 transition-colors text-left border-none cursor-pointer"
                aria-expanded={promoOpen}
              >
                <span className="font-sans text-[12px] text-sand-900/60 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                  {promoCode ? (
                    <span className="text-green-600 font-medium">
                      {promoCode} — {PROMO_DISCOUNT_PCT}% off
                    </span>
                  ) : "¿Tenés un código de descuento?"}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-sand-900/30 transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {promoOpen && (
                <div className="px-3 py-3 border-t border-sand-100 bg-white">
                  {promoCode ? (
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-[12px] text-green-600">
                        Ahorro de <strong>{formatPrice(discount)}</strong>
                      </p>
                      <button type="button" onClick={handleRemovePromo}
                        className="font-sans text-[11px] text-watermelon hover:opacity-70 bg-transparent border-none cursor-pointer">
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text" value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                        placeholder="Ej: KORA26" maxLength={20} autoComplete="off" spellCheck={false}
                        className="promo-input py-1.5"
                        aria-label="Código de descuento"
                      />
                      <button type="button" onClick={handleApplyPromo}
                        className="px-3 py-1.5 bg-petrol text-white rounded-f2-md font-sans text-[11px] tracking-[0.06em] uppercase border-none cursor-pointer hover:bg-petrol/90 transition-colors shrink-0">
                        Aplicar
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p role="alert" className="font-sans text-[11px] text-watermelon mt-1.5">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mb-4">
              {discount > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-sand-900/40 font-sans">Subtotal</span>
                    <span className="text-[13px] text-sand-900/40 font-sans line-through">{totalStr}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] text-green-600 font-sans font-medium">Descuento ({promoCode})</span>
                    <span className="text-[13px] text-green-600 font-sans font-medium">−{formatPrice(discount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-sand-100">
                    <span className="text-[14px] font-medium text-sand-900 font-sans">Total</span>
                    <span className="font-display text-[26px] text-petrol leading-none">{formatPrice(totalWithPromo)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-medium text-sand-900 font-sans">Total</span>
                  <span className="font-display text-[26px] text-petrol leading-none">{totalStr}</span>
                </div>
              )}
            </div>

            <a
              href="/checkout"
              className="f2-button-primary flex items-center justify-center w-full h-[54px] text-[13px]! tracking-widest no-underline gap-2"
            >
              Ir al Checkout
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
