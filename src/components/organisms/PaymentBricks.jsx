/**
 * PaymentBricks Organism — React Island
 * BeautyHome · NODO Studio
 * * Arquitectura:
 * - Race-condition safe: Espera activamente al SDK de MP antes de inicializar.
 * - Delega el estado de "Cargando" al HTML padre (Astro) vía eventos.
 * - Maneja el ciclo de vida estricto para evitar duplicación de iframes.
 */

import { useState, useEffect, useRef } from "react";

export default function PaymentBricks({ publicKey, preferenceId, amount }) {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!publicKey || !preferenceId || !amount) {
      setHasError(true);
      setErrorMsg("Faltan parámetros de pago. Por favor, vuelve al checkout.");
      return;
    }

    let isMounted = true;

    const initializeBrick = async () => {
      try {
        // 1. GUARDIÁN ASÍNCRONO: Aseguramos que el SDK esté cargado
        await loadMPScript();

        if (!isMounted) return;

        const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
        const bricksBuilder = mp.bricks();

        // 2. Configuración Visual y de Negocio
        const settings = {
          initialization: {
            amount: amount,
            preferenceId: preferenceId,
          },
          customization: {
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              ticket: "all",
              bankTransfer: "all",
              mercadoPago: "all",
            },
            visual: {
              style: {
                theme: "flat",
                customVariables: {
                  baseColor: "#0b3948", // petrol
                  baseColorFirstVariant: "#051c24",
                  baseColorSecondVariant: "#0b3948",
                  errorColor: "#ee4266", // watermelon
                  successColor: "#059669",
                  warningColor: "#d4a853",
                  fontSizeSmall: "12px",
                  fontSizeMedium: "14px",
                  formInputsTextFontSize: "14px",
                  formInputsBackgroundColor: "#f9f8f6", // sand-50
                  inputFocusedBorderColor: "#0b3948",
                  borderRadiusFull: "8px",
                  borderRadiusMedium: "8px",
                  fontFamilyDefault: "DM Sans, system-ui, sans-serif",
                },
              },
              hideNewCardSection: false,
              hidePaymentButton: false,
            },
          },
          callbacks: {
            onReady: () => {
              if (!isMounted) return;
              // 3. Avisamos a Astro que destruya el Skeleton
              window.dispatchEvent(new Event("mercadopago:ready"));
            },
            onSubmit: async ({ selectedPaymentMethod }) => {
              console.log("[PaymentBricks] Submit:", selectedPaymentMethod);
            },
            onError: (error) => {
              console.error("[MP Brick Error]", error);
              if (isMounted) {
                setHasError(true);
                setErrorMsg("Ocurrió un error en el formulario de pago. Por favor, recarga la página.");
              }
            },
          },
        };

        // 4. Montaje Seguro (Evita duplicados en React Strict Mode)
        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = "";

          controllerRef.current = await bricksBuilder.create(
            "payment",
            "payment-brick-container",
            settings
          );
        }
      } catch (err) {
        console.error("[Payment Initialization Failed]", err);
        if (isMounted) {
          setHasError(true);
          setErrorMsg("No se pudo conectar con el servidor de pagos.");
        }
      }
    };

    initializeBrick();

    // 5. Limpieza Estricta
    return () => {
      isMounted = false;
      if (controllerRef.current && typeof controllerRef.current.unmount === "function") {
        try {
          controllerRef.current.unmount();
        } catch (e) {
          console.warn("Error silencioso al desmontar el Brick", e);
        }
      }
    };
  }, [publicKey, preferenceId]);

  if (hasError) {
    setTimeout(() => window.dispatchEvent(new Event("mercadopago:ready")), 50);

    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-watermelon/10 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-watermelon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="font-display text-2xl font-light text-petrol mb-3">
          Connection Interrupted
        </p>
        <p className="font-sans text-sm text-sand-900/60 max-w-sm mb-8">
          {errorMsg}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-md"
          >
            Retry Connection
          </button>
          <a href="/checkout" className="btn btn-secondary btn-md no-underline">
            Back to Checkout
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      id="payment-brick-container"
      ref={containerRef}
      className="w-full min-h-[400px]"
    />
  );
}

// ── SDK Loader (Restaurado para prevenir Race Conditions) ──
function loadMPScript() {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MercadoPago SDK"));
    document.head.appendChild(script);
  });
}