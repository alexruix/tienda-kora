/**
 * CartSummary.jsx — Molecule
 * BeautyHome / KORA · NODO Studio
 *
 * Desglose de totales para el carrito o checkout.
 */

import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export function CartSummary({ 
  subtotal, 
  discount = 0, 
  shippingOptions = [], 
  onCheckout,
  isCheckingOut = false,
  className = ''
}) {
  const finalTotal = subtotal - discount; // Envío se calcula asíncrono o después

  return (
    <div className={`flex flex-col gap-4 border-t border-sand-200 pt-6 ${className}`}>
      
      {/* Subtotal */}
      <div className="flex justify-between items-center font-sans text-[14px] text-sand-900/60">
        <span>Subtotal</span>
        <span className="text-sand-900 font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Descuentos (si los hay) */}
      {discount > 0 && (
        <div className="flex justify-between items-center font-sans text-[14px] text-watermelon">
          <span>Descuento</span>
          <span className="font-medium">-{formatCurrency(discount)}</span>
        </div>
      )}

      {/* Envío Placeholder */}
      <div className="flex justify-between items-center font-sans text-[14px] text-sand-900/60">
        <span>Envío</span>
        <span className="text-sand-900/40 italic">Calculado en el checkout</span>
      </div>

      <div className="w-full h-px bg-sand-200 my-2"></div>

      {/* Total Final */}
      <div className="flex justify-between items-end font-sans">
        <span className="text-base font-semibold text-petrol">Total</span>
        <span className="text-xl lg:text-2xl font-semibold text-petrol">{formatCurrency(finalTotal)}</span>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={isCheckingOut || subtotal === 0}
          className="mt-2 w-full flex items-center justify-center gap-2 h-12 rounded-f2-md bg-watermelon text-white font-sans text-[13px] font-semibold tracking-[0.08em] uppercase hover:bg-watermelon-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCheckingOut ? 'Procesando...' : 'Iniciar Pago Seguró'}
        </button>
      )}

      {/* Trust info under button */}
      <p className="text-center font-sans text-[11px] text-sand-900/40 uppercase tracking-[0.05em] mt-1">
        Pagos seguros mediante MercadoPago
      </p>
    </div>
  );
}
