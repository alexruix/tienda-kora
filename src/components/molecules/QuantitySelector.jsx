/**
 * QuantitySelector.jsx — Molecule
 * BeautyHome / KORA · NODO Studio
 *
 * Control de cantidad interactivo. Se puede usar tanto en la vista
 * de producto (PDP) como en el carrito lateral (CartDrawer).
 */

import React from 'react';
import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({ 
  quantity, 
  onIncrease = () => {}, 
  onDecrease = () => {}, 
  min = 1, 
  max = 99,
  size = 'md',
  className = '',
  id 
}) {
  const isAtMin = quantity <= min;
  const isAtMax = quantity >= max;

  const sizeStyles = {
    sm: 'h-8 px-2 text-[12px]',
    md: 'h-11 px-3 text-[14px]',
    lg: 'h-14 px-4 text-[16px]',
  };

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <div id={id} className={`inline-flex items-center border border-sand-200 rounded-f2-md bg-white ${sizeStyles[size]} ${className}`}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={isAtMin}
        className="flex h-full items-center justify-center text-sand-500 hover:text-petrol disabled:opacity-30 disabled:hover:text-sand-500 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} strokeWidth={2.5} />
      </button>

      <span className="flex-1 text-center font-sans font-medium text-petrol min-w-8">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={isAtMax}
        className="flex h-full items-center justify-center text-sand-500 hover:text-petrol disabled:opacity-30 disabled:hover:text-sand-500 transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}
