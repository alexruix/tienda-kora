/**
 * PaymentBricks Organism — React Island
 * BeautyHome · NODO Studio
 *
 * Carga el SDK de MercadoPago dinámicamente y monta el Brick de pago.
 * El PUBLIC_KEY viene como prop desde Astro (variable de entorno pública).
 * El preferenceId viene por query param.
 */

import { useState, useEffect, useRef } from "react";

export default function PaymentBricks({ publicKey, preferenceId }) {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const brickContainerRef = useRef(null);
  const brickControllerRef = useRef(null);

  useEffect(() => {
    if (!publicKey || !preferenceId) {
      setStatus("error");
      setErrorMsg("Faltan parámetros de pago. Por favor volvé al checkout.");
      return;
    }

    let isMounted = true;

    const initBricks = async () => {
      try {
        // 1. Cargar el SDK de MercadoPago dinámicamente
        await loadMPScript();

        if (!isMounted) return;

        // 2. Instanciar MercadoPago con la PUBLIC_KEY
        const mp = new (window as any).MercadoPago(publicKey, {
          locale: "es-AR",
        });

        // 3. Crear el BricksBuilder
        const bricksBuilder = mp.bricks();

        // 4. Configurar y montar el Brick de pago
        //    Usamos "payment" brick que incluye card + otros métodos
        const settings = {
          initialization: {
            amount: 0,           // El monto lo controla la preferencia en MP
            preferenceId,        // Vincula al brick con la preferencia creada
          },
          customization: {
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              ticket: "all",          // Rapipago, Pagofácil
              bankTransfer: "all",    // Transferencia bancaria
              mercadoPago: "all",     // Cuotas sin tarjeta, dinero en MP
            },
            visual: {
              style: {
                theme: "flat",        // flat | default | dark | bootstrap
                customVariables: {
                  // Mapear los tokens del Design System al theme del Brick
                  baseColor: "#0b3948",         // petrol
                  baseColorFirstVariant: "#051c24",
                  baseColorSecondVariant: "#0b3948",
                  errorColor: "#ee4266",         // watermelon
                  successColor: "#3d9970",
                  warningColor: "#d4a853",
                  fontSizeSmall: "12px",
                  fontSizeMedium: "14px",
                  formInputsTextFontSize: "14px",
                  formInputsBackgroundColor: "#f2efe9",  // sand-100
                  inputFocusedBorderColor: "#0b3948",
                  borderRadiusFull: "8px",               // f2-md
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
              if (isMounted) setStatus("ready");
            },
            onSubmit: async ({ selectedPaymentMethod, formData }) => {
              // El Brick maneja el submit internamente cuando hay preferenceId.
              // Este callback se dispara antes de la redirección.
              console.log("[PaymentBricks] Submit:", selectedPaymentMethod);
              // Podés mostrar un loading state aquí si querés
            },
            onError: (error) => {
              console.error("[PaymentBricks] Brick error:", error);
              if (isMounted) {
                setErrorMsg("Ocurrió un error en el formulario de pago. Por favor recargá la página.");
              }
            },
          },
        };

        if (brickContainerRef.current) {
          brickControllerRef.current = await bricksBuilder.create(
            "payment",
            "payment-brick-container",
            settings
          );
        }
      } catch (err) {
        console.error("[PaymentBricks] Init error:", err);
        if (isMounted) {
          setStatus("error");
          setErrorMsg("No se pudo cargar el formulario de pago. Por favor intentá de nuevo.");
        }
      }
    };

    initBricks();

    // Cleanup: destruir el brick al desmontar
    return () => {
      isMounted = false;
      brickControllerRef.current?.unmount();
    };
  }, [publicKey, preferenceId]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-watermelon/10 flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-watermelon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="font-display text-[22px] font-light text-petrol mb-2">
          Payment Error
        </p>
        <p className="font-sans text-[14px] text-sand-900/60 max-w-sm mb-6">
          {errorMsg}
        </p>
        <a
          href="/checkout"
          className="f2-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-[12px] tracking-[0.07em] uppercase no-underline"
        >
          Back to Checkout
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col gap-4 p-6 animate-pulse z-10">
          <div className="h-4 bg-sand-200 rounded-full w-1/3" />
          <div className="h-12 bg-sand-100 rounded-f2-md" />
          <div className="h-12 bg-sand-100 rounded-f2-md" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-sand-100 rounded-f2-md" />
            <div className="h-12 bg-sand-100 rounded-f2-md" />
          </div>
          <div className="h-12 bg-sand-200 rounded-f2-md mt-2" />
        </div>
      )}

      {/* El Brick se monta aquí */}
      <div
        id="payment-brick-container"
        ref={brickContainerRef}
        className={status === "loading" ? "opacity-0" : "opacity-100 transition-opacity duration-300"}
      />
    </div>
  );
}

// ── SDK Loader ────────────────────────────────────────────────────────────────

function loadMPScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Si ya está cargado, resolver inmediatamente
    if ((window as any).MercadoPago) {
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