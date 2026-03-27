import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { QuantitySelector } from './QuantitySelector';
import { pdpQuantity } from '../../store/cart';

export function PDPAddToCart({ productId }) {
  const quantity = useStore(pdpQuantity);
  const [isAdding, setIsAdding] = useState(false);

  // Asegurar que inicie en 1 al montar
  useEffect(() => {
    pdpQuantity.set(1);
  }, [productId]);

  const handleIncrease = () => pdpQuantity.set(Math.min(quantity + 1, 99));
  const handleDecrease = () => pdpQuantity.set(Math.max(quantity - 1, 1));

  const handleAdd = () => {
    setIsAdding(true);
    
    window.dispatchEvent(new CustomEvent("cart:add", { 
      detail: { 
        id: productId, 
        quantity: quantity 
      } 
    }));

    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="w-[120px] shrink-0">
        <QuantitySelector 
          quantity={quantity} 
          onIncrease={handleIncrease} 
          onDecrease={handleDecrease} 
          className="w-full"
        />
      </div>
      
      <button 
        onClick={handleAdd}
        disabled={isAdding}
        className={`flex-1 h-12 rounded-f2-md font-sans text-[13px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-none cursor-pointer ${
          isAdding 
            ? 'bg-success text-white' 
            : 'bg-petrol text-white hover:bg-petrol/90'
        }`}
      >
        {isAdding ? (
          <>✓ Agregado</>
        ) : (
          <>
            <ShoppingBag size={16} strokeWidth={2.5} />
            Agregar al Carrito
          </>
        )}
      </button>
    </div>
  );
}
