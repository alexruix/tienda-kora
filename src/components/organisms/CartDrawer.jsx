/**
 * CartDrawer Organism — React Island
 * BeautyHome · NODO Studio
 */
import { useEffect, useState } from "react";
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
  removeCartItem,
  setCartQuantity,
  toggleCart,
} from "../../store/cart.ts";

// ✅ RECIBIMOS 'products' como prop
export default function CartDrawer({ products = [] }) {
  const [isMounted, setIsMounted] = useState(false);

  const itemsMap = useStore(cartItems);
  const isOpen = useStore(isCartOpen);
  const itemCount = useStore(cartCount);
  const isFreeShipping = useStore(hasFreeShipping);
  const remainingForFree = useStore(freeShippingRemaining);
  const totalStr = useStore(cartTotalFormatted);
  const subtotal = useStore(cartTotal);

  const items = Object.values(itemsMap);

  useEffect(() => {
    setIsMounted(true);

    const handleAddToCart = (e) => {
      const { id, variant } = e.detail;

      if (!id) return;

      // 🛡️ Búsqueda local SEGURA (Sin fetch redundante)
      // Usamos la prop 'products' que viene de Astro
      const productData = products.find((p) => p.id === id);

      if (productData) {
        addCartItem({
          id: productData.id,
          name: productData.name,
          price: productData.price,
          image: productData.image ?? "",
          variant: variant || "Standard",
        });
      } else {
        console.error(`[CartDrawer] Producto no encontrado: ${id}`);
      }
    };

    window.addEventListener("cart:add", handleAddToCart);
    return () => window.removeEventListener("cart:add", handleAddToCart);
  }, [products]); // Añadimos products como dependencia

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isMounted) return null;
  return (
    <>
      {/* Overlay - Fluent Backdrop */}
      <div
        className={`fixed inset-0 bg-petrol/20 z-[2000] backdrop-blur-sm transition-all duration-[380ms] ease-fluent ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={toggleCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 w-full sm:w-[420px] h-[100dvh] bg-sand-50 z-[2001] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-[380ms] ease-fluent ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5 border-b border-sand-200 bg-white">
          <div>
            <h2 className="font-display text-[26px] font-light text-petrol leading-none">
              Shopping Bag
            </h2>
            <p className="font-sans text-[13px] text-sand-900/50 mt-1">
              {itemCount > 0
                ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
                : "Empty"}
            </p>
          </div>
          <button
            onClick={toggleCart}
            className="w-9 h-9 rounded-f2-md flex items-center justify-center hover:bg-sand-100 f2-transition text-sand-900/40 hover:text-sand-900 cursor-pointer border-none bg-transparent"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 px-6 [-webkit-overflow-scrolling:touch]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in-up">
              <p className="text-[18px] font-display text-petrol/60 mb-4 text-balance">
                Your bag is empty
              </p>
              <button
                className="f2-button-primary !text-[12px] uppercase tracking-widest"
                onClick={toggleCart}
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Progress Bar - Usando lógicas del Store */}
              {!isFreeShipping && (
                <div className="bg-white rounded-f2-md py-3 px-4 my-3 shadow-f2-rest">
                  <p className="font-sans text-[12px] text-sand-900/70 mb-2">
                    Add{" "}
                    <strong className="text-petrol">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "ARS",
                        minimumFractionDigits: 0,
                      }).format(remainingForFree)}
                    </strong>{" "}
                    more for free shipping
                  </p>
                  <div className="h-[4px] bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-watermelon transition-[width] duration-[800ms] ease-fluent"
                      style={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }} // ✅
                    />
                  </div>
                </div>
              )}
              {isFreeShipping && (
                <div className="flex items-center gap-2 text-[12px] text-petrol font-medium py-3 mb-2 bg-sand-200/50 px-4 rounded-f2-md animate-fade-in">
                  <span className="text-watermelon">✦</span> You've unlocked
                  free shipping!
                </div>
              )}

              <div className="flex flex-col gap-4 mt-4">
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 px-6 border-t border-sand-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="mb-6 flex justify-between items-center">
              <span className="text-[15px] font-medium text-sand-900 font-sans">
                Total
              </span>
              <span className="font-display text-[28px] text-petrol leading-none">
                {totalStr}
              </span>
            </div>
            <a
              href="/checkout"
              className="f2-button-primary flex items-center justify-center w-full h-[54px] !text-[13px] tracking-widest no-underline"
            >
              PROCEED TO CHECKOUT →
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
