/**
 * CartItem Molecule — React
 * BeautyHome · NODO Studio
 *
 * Used inside CartDrawer organism.
 */

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
  // Guard: si price o quantity son undefined, no renderizar
  if (price == null || quantity == null) {
    console.warn(`[CartItem] item ${id} tiene datos incompletos — ignorado`, {
      price,
      quantity,
    });
    return null;
  }

  
  const formattedPrice = price.toLocaleString("en-US", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
});

  const lineTotal = (price * quantity).toLocaleString("en-US", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  return (
    <div className="flex gap-4 py-4 border-b border-sand-200 animate-slide-right">
      {/* Product Image */}
      <div
        className="w-[72px] h-[80px] rounded-f2-md bg-sand-100 overflow-hidden shrink-0"
        aria-hidden="true"
      >
        {image ? ( // ✅ ternario explícito
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <svg
            viewBox="0 0 72 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="80"
          >
            <rect width="72" height="80" fill="#E5DFD3" />
            <rect x="8" y="40" width="56" height="24" rx="5" fill="#CEC5B5" />
            <rect x="10" y="34" width="52" height="12" rx="4" fill="#B5A896" />
            <rect x="6" y="36" width="60" height="8" rx="3" fill="#CEC5B5" />
            <rect x="16" y="64" width="8" height="10" rx="2" fill="#B5A896" />
            <rect x="48" y="64" width="8" height="10" rx="2" fill="#B5A896" />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <a
          href={`/product/${id}`}
          className="text-[14px] font-normal text-sand-900 leading-[1.4] no-underline transition-colors duration-150 hover:text-petrol"
        >
          {name}
        </a>

        {variant && (
          <p className="text-[12px] text-sand-900/50 leading-[1.4]">
            {variant}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3">
          {/* Quantity Stepper */}
          <div
            className="flex items-center gap-2 bg-sand-100 rounded-f2-md p-1"
            role="group"
            aria-label="Quantity"
          >
            <button
              className="w-[26px] h-[26px] rounded-f2-sm bg-transparent flex items-center justify-center cursor-pointer text-sand-900/70 border-none transition-colors duration-150 hover:enabled:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => onQtyChange?.(quantity - 1)}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span
              className="text-[13px] font-medium min-w-[20px] text-center text-sand-900"
              aria-live="polite"
              aria-atomic="true"
            >
              {quantity}
            </span>
            <button
              className="w-[26px] h-[26px] rounded-f2-sm bg-transparent flex items-center justify-center cursor-pointer text-sand-900/70 border-none transition-colors duration-150 hover:enabled:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => onQtyChange?.(quantity + 1)}
              aria-label="Increase quantity"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Remove */}
          <button
            className="text-[11px] tracking-[0.06em] uppercase text-sand-900/50 cursor-pointer bg-none border-none p-0 transition-colors duration-150 font-sans hover:text-watermelon"
            onClick={() => onRemove?.()}
            aria-label={`Remove ${name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line Price */}
      <div
        className="text-[15px] font-medium text-petrol shrink-0 whitespace-nowrap"
        aria-label={`${quantity} × ${formattedPrice} = ${lineTotal}`}
      >
        {lineTotal}
      </div>
    </div>
  );
}
