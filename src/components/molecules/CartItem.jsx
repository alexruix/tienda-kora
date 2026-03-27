/**
 * CartItem Molecule — React
 * BeautyHome · NODO Studio
 */

import { formatCurrency } from "../../utils/formatters.ts";

export default function CartItem({
  id,
  name,
  variant,
  price,
  quantity,
  image,
  onRemove,
  onQtyChange,
}) {
  // 🛡️ Guard mejorada: Solo fallamos si realmente no hay ID o nombre.
  // Si el precio es 0, sigue siendo un producto válido (ej. regalo).
  if (!id || !name) {
    console.error(`[CartItem] Datos críticos faltantes para el item: ${id}`);
    return null;
  }

  // Calculamos el subtotal de la línea
  const itemPrice = price || 0;
  const itemQuantity = quantity || 1;
  const lineTotalValue = itemPrice * itemQuantity;

  return (
    <div className="flex gap-4 py-4 border-b border-sand-200 animate-slide-right">
      {/* Product Image */}
      <div
        className="w-[72px] h-[80px] rounded-f2-md bg-sand-100 overflow-hidden shrink-0 shadow-sm"
        aria-hidden="true"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand-200 text-sand-400">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M20 9l-8-7-8 7v10a2 2 0 002 2h12a2 2 0 002-2V9z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <a
            href={`/product/${id}`}
            className="text-[14px] font-medium text-sand-900 leading-tight no-underline transition-colors duration-150 hover:text-petrol block truncate"
          >
            {name}
          </a>
          {variant && (
            <p className="text-[11px] uppercase tracking-wider text-sand-900/40 mt-1">
              {variant}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity Stepper */}
          <div
            className="flex items-center bg-sand-100 rounded-f2-md p-0.5 border border-sand-200/50"
            role="group"
            aria-label="Quantity"
          >
            <button
              className="w-7 h-7 flex items-center justify-center cursor-pointer text-sand-900/70 border-none bg-transparent hover:bg-white rounded-f2-sm f2-transition disabled:opacity-20"
              onClick={() => onQtyChange?.(itemQuantity - 1)}
              disabled={itemQuantity <= 1}
              type="button"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <span className="text-[12px] font-sans font-semibold min-w-[24px] text-center text-petrol">
              {itemQuantity}
            </span>

            <button
              className="w-7 h-7 flex items-center justify-center cursor-pointer text-sand-900/70 border-none bg-transparent hover:bg-white rounded-f2-sm f2-transition"
              onClick={() => onQtyChange?.(itemQuantity + 1)}
              type="button"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <button
            className="text-[10px] tracking-widest uppercase text-sand-900/30 cursor-pointer bg-none border-none p-0 transition-colors duration-150 font-sans hover:text-watermelon font-bold"
            onClick={() => onRemove?.()}
          >
            Quitar
          </button>
        </div>
      </div>

      {/* Line Price */}
      <div className="text-right flex flex-col justify-between py-0.5">
        <div className="text-[15px] font-medium text-petrol font-sans">
          {formatCurrency(lineTotalValue)}
        </div>
        {itemQuantity > 1 && (
          <div className="text-[10px] text-sand-900/40">
            {formatCurrency(itemPrice)} c/u
          </div>
        )}
      </div>
    </div>
  );
}
