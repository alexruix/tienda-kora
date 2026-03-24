/**
 * Toast Atom — React Island
 * KORA · NODO Studio
 *
 * Snackbar de confirmación que aparece cuando el usuario agrega un ítem al carrito.
 * - Posición: bottom-[80px] (sobre BottomNavBar en mobile), bottom-6 en desktop
 * - Duración: 2500ms auto-dismiss
 * - Animación: slide-up + fade-out
 *
 * Escucha el CustomEvent global 'cart:add'
 * Recibe los productos via prop para resolver nombre e imagen
 */
import { useEffect, useState, useCallback, useRef } from "react";

interface ToastItem {
  id: string;
  name: string;
  image?: string;
  key: number;
}

interface Props {
  products?: Array<{ id: string; name: string; image?: string }>;
}

const TOAST_DURATION = 2500;

export function Toast({ products = [] }: Props) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    fadeTimer.current = setTimeout(() => setToast(null), 350);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleCartAdd = (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      if (!id) return;

      // Limpiar timers previos
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);

      const product = products.find((p) => p.id === id);
      if (!product) return;

      keyRef.current += 1;
      setToast({ id, name: product.name, image: product.image, key: keyRef.current });
      // Forzar reflow para re-triggerear animación
      requestAnimationFrame(() => setVisible(true));

      dismissTimer.current = setTimeout(dismiss, TOAST_DURATION);
    };

    window.addEventListener("cart:add", handleCartAdd);
    return () => {
      window.removeEventListener("cart:add", handleCartAdd);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [isMounted, products, dismiss]);

  if (!isMounted || !toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Producto agregado al carrito"
      className={[
        "fixed left-4 right-4 sm:left-auto sm:right-6 sm:w-[340px]",
        // Mobile: encima del BottomNavBar (56px) + safe-area + gap
        "bottom-[76px] lg:bottom-6",
        "z-3000",
        "bg-white rounded-f2-xl border border-sand-200 shadow-[0_8px_32px_rgba(0,0,0,0.14)]",
        "flex items-center gap-4 p-3 pr-4",
        "transition-all duration-300 ease-fluent",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-f2-md bg-sand-100 overflow-hidden shrink-0 border border-sand-200">
        {toast.image ? (
          <img src={toast.image} alt={toast.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sand-400">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-green-600">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          <p className="font-sans text-[11px] font-medium text-green-600 uppercase tracking-wider">Agregado al carrito</p>
        </div>
        <p className="font-sans text-[13px] text-sand-900 font-medium truncate">{toast.name}</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="shrink-0 w-6 h-6 flex items-center justify-center text-sand-400 hover:text-sand-900 transition-colors border-none bg-transparent cursor-pointer"
        aria-label="Cerrar notificación"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Progress bar */}
      <div className={[
        "absolute bottom-0 left-0 right-0 h-[2px] bg-petrol rounded-full origin-left",
        visible ? "animate-[shrink_2.5s_linear_forwards]" : "",
      ].join(" ")} />
    </div>
  );
}

export default Toast;
