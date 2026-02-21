/**
 * CartDrawer Organism — React Island
 * BeautyHome · NODO Studio
 */

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import CartItem from '../molecules/CartItem.jsx';
import {
  cartItems,
  isCartOpen,
  cartTotal,
  cartCount,
  removeCartItem,
  setCartQuantity,
  toggleCart
} from '../../store/cart.ts';

// Utilidad local para no depender de archivos externos si no los tienes
const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

export default function CartDrawer() {
  // 1. Nos suscribimos a los átomos computados de Nanostores
  const itemsMap = useStore(cartItems);
  const isOpen = useStore(isCartOpen);
  const subtotal = useStore(cartTotal);
  const itemCount = useStore(cartCount);

  // Convertimos el objeto de items en un array para iterar
  const items = Object.values(itemsMap);
  const freeShipping = subtotal >= 350;

  // 2. Bloqueo de scroll nativo cuando el carrito está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* ─── Overlay (Fluent Acrylic Backdrop) ─── */}
      <div
        className={`fixed inset-0 bg-petrol/20 z-[2000] backdrop-blur-sm transition-all duration-[380ms] ease-fluent ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleCart}
        aria-hidden="true"
      />

      {/* ─── Drawer ─── */}
      <aside
        className={`fixed top-0 right-0 w-full sm:w-[420px] h-[100dvh] bg-sand-50 z-[2001] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-[380ms] ease-fluent ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5 border-b border-sand-200 shrink-0 bg-white">
          <div>
            <h2 className="font-display text-[26px] font-light text-petrol leading-none">Shopping Bag</h2>
            <p className="font-sans text-[13px] text-sand-900/50 mt-1">
              {itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Empty'}
            </p>
          </div>
          <button
            className="w-9 h-9 rounded-f2-md flex items-center justify-center cursor-pointer bg-transparent border-none text-sand-900/70 shrink-0 f2-transition hover:bg-sand-100 hover:text-sand-900"
            onClick={toggleCart}
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 px-6 [-webkit-overflow-scrolling:touch]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center text-sand-900/40">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-[18px] font-normal text-petrol font-display">Your bag is empty</p>
              <p className="font-sans text-[14px] text-sand-900/50 leading-[1.6] max-w-[240px]">
                Add pieces you love and they'll appear here.
              </p>
              <button
                className="mt-4 f2-button-primary !text-[12px] tracking-[0.06em] uppercase"
                onClick={toggleCart}
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <>
              {/* Free shipping progress */}
              {!freeShipping && (
                <div className="bg-white rounded-f2-md py-3 px-4 my-3 shadow-f2-rest">
                  <p className="font-sans text-[12px] text-sand-900/70 mb-2">
                    Add <strong className="text-petrol">{formatPrice(350 - subtotal)}</strong> more for free shipping
                  </p>
                  <div className="h-[4px] bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-watermelon rounded-full transition-[width] duration-[600ms] ease-fluent"
                      style={{ width: `${Math.min((subtotal / 350) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {freeShipping && (
                <div className="flex items-center gap-2 text-[12px] text-petrol font-medium py-3 mb-2 bg-sand-200/50 px-4 rounded-f2-md">
                  <span className="text-watermelon">✦</span>
                  You've unlocked free shipping!
                </div>
              )}

              <div className="flex flex-col gap-4 mt-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
                    // Pasamos las acciones reales del store
                    onRemove={() => removeCartItem(item.id)}
                    onQtyChange={(qty) => setCartQuantity(item.id, qty)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 px-6 border-t border-sand-200 shrink-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="mb-5 font-sans">
              <div className="flex justify-between text-[14px] text-sand-900/70 py-1">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-sand-900/70 py-1">
                <span>Shipping</span>
                <span className={freeShipping ? 'text-watermelon font-medium' : 'opacity-70'}>
                  {freeShipping ? 'Free' : 'Calculated at checkout'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-sand-200">
                <span className="text-[15px] font-medium text-sand-900">Total</span>
                <span className="font-display text-[28px] font-normal text-petrol">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Reemplazamos la marea de clases por tus tokens */}
            <a href="/checkout" className="f2-button-primary flex items-center justify-center w-full h-[52px] !text-[13px] tracking-[0.1em] mb-3">
              Proceed to Checkout →
            </a>

            <button
              className="flex items-center justify-center w-full h-[42px] bg-transparent text-sand-900/70 border-[1.5px] border-sand-200 rounded-f2-lg font-sans text-[12px] tracking-[0.06em] uppercase cursor-pointer f2-transition hover:bg-sand-100 hover:border-sand-300 hover:text-sand-900"
              onClick={toggleCart}
            >
              Continue Shopping
            </button>

            <p className="flex items-center justify-center gap-2 font-sans text-[11px] text-sand-900/40 mt-5 tracking-[0.02em] uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secure checkout · SSL encrypted
            </p>
          </div>
        )}
      </aside>
    </>
  );
}