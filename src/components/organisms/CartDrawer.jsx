/**
 * CartDrawer Organism — React Island
 * BeautyHome · NODO Studio
 *
 * Slide-in shopping cart panel using Fluent 2 motion.
 * Listens for global 'cart:open' / 'cart:add' events.
 * Composes: CartItem (molecule)
 */

import { useState, useEffect, useCallback } from 'react';
import CartItem from '../molecules/CartItem.jsx';
import { formatPrice } from '../../utils/formatters.js'; 

const INITIAL_ITEMS = [
  { id: 'sokaku-sofa', name: 'Sōkaku Sofa — 3-seater', variant: 'Oat Linen · Natural Oak Frame', price: 2890, quantity: 1 },
  { id: 'hana-pendant', name: 'Hana Pendant Light', variant: 'Washi Paper · Brass Hardware', price: 580, quantity: 1 },
];


export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(INITIAL_ITEMS);

  // Global event listeners
  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    const addHandler = (e) => {
      const { id, name, price, variant = '' } = e.detail;
      setItems((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (existing) {
          return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { id, name, variant, price, quantity: 1 }];
      });
      setIsOpen(true);
    };

    window.addEventListener('cart:open', openHandler);
    window.addEventListener('cart:add', addHandler);
    return () => {
      window.removeEventListener('cart:open', openHandler);
      window.removeEventListener('cart:add', addHandler);
    };
  }, []);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleQtyChange = useCallback((id, qty) => {
    if (qty <= 0) {
      handleRemove(id);
      return;
    }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, [handleRemove]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const freeShipping = subtotal >= 350;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-sand-900/40 z-[2000] backdrop-blur-[2px] transition-opacity duration-[380ms] ease-fluent ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 w-full sm:w-[420px] h-[100dvh] bg-white z-[2001] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.08)] transition-transform duration-[380ms] ease-fluent ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5 border-b border-sand-200 shrink-0">
          <div>
            <h2 className="font-display text-[26px] font-light text-petrol leading-none">Shopping Bag</h2>
            <p className="text-[13px] text-sand-900/50 mt-1">
              {itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Empty'}
            </p>
          </div>
          <button
            className="w-9 h-9 rounded-f2-md flex items-center justify-center cursor-pointer bg-transparent border-none text-sand-900/70 shrink-0 transition-colors duration-150 hover:bg-sand-100 hover:text-sand-900"
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-2 px-6 [-webkit-overflow-scrolling:touch]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center text-sand-900/40">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-[18px] font-normal text-sand-900/70 font-display">Your bag is empty</p>
              <p className="text-[14px] text-sand-900/50 leading-[1.6] max-w-[240px]">Add pieces you love and they&rsquo;ll appear here.</p>
              <button
                className="mt-2 px-6 py-2.5 bg-petrol text-white border-none rounded-f2-md font-sans text-[13px] tracking-[0.06em] uppercase cursor-pointer transition-colors duration-150 hover:bg-petrol-dark"
                onClick={() => setIsOpen(false)}
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <>
              {/* Free shipping progress */}
              {!freeShipping && (
                <div className="bg-sand-100 rounded-f2-md py-3 px-4 my-3">
                  <p className="text-[12px] text-sand-900/70 mb-2">
                    Add <strong>{formatPrice(350 - subtotal)}</strong> more for free shipping
                  </p>
                  <div className="h-[3px] bg-sand-200 rounded-sm overflow-hidden">
                    <div className="h-full bg-petrol rounded-sm transition-[width] duration-[380ms] ease-fluent" style={{ width: `${Math.min((subtotal / 350) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
              {freeShipping && (
                <div className="flex items-center gap-2 text-[12px] text-[#4CAF50] font-medium py-3 mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  You&rsquo;ve unlocked free shipping!
                </div>
              )}

              {items.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onRemove={handleRemove}
                  onQtyChange={handleQtyChange}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 px-6 border-t border-sand-200 shrink-0 bg-white">
            <div className="mb-5">
              <div className="flex justify-between text-[14px] text-sand-900/70 py-1">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-sand-900/70 py-1">
                <span>Shipping</span>
                <span style={{ color: freeShipping ? '#4CAF50' : 'var(--color-sand-900)' }} className={freeShipping ? '' : 'opacity-70'}>
                  {freeShipping ? 'Free' : 'Calculated at checkout'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-sand-200">
                <span className="text-[15px] font-medium text-sand-900">Total</span>
                <span className="font-display text-[28px] font-normal text-petrol">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <a href="/checkout" className="flex items-center justify-center w-full h-[50px] bg-watermelon text-white border-none rounded-f2-lg font-sans text-[13px] font-medium tracking-[0.1em] uppercase cursor-pointer no-underline transition-colors duration-150 mb-3 hover:bg-watermelon-hover">
              Proceed to Checkout →
            </a>
            <button
              className="flex items-center justify-center w-full h-[42px] bg-transparent text-sand-900/70 border-[1.5px] border-sand-300 rounded-f2-lg font-sans text-[12px] tracking-[0.06em] uppercase cursor-pointer transition-all duration-150 hover:bg-sand-100 hover:border-sand-400 hover:text-sand-900"
              onClick={() => setIsOpen(false)}
            >
              Continue Shopping
            </button>

            <p className="flex items-center justify-center gap-2 text-[12px] text-sand-900/50 mt-4 tracking-[0.02em]">
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