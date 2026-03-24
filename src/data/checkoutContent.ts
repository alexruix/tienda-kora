export const CheckoutContent = {
  // Breadcrumbs y navegacion global de checkout
  breadcrumbs: {
    home: "Inicio",
    checkout: "Checkout",
    payment: "Pago"
  },
  
  // Nombres de los pasos
  steps: {
    step1: {
      number: "1",
      label: "Datos"
    },
    step2: {
      number: "2",
      label: "Pago"
    }
  },

  // Formulario principal (Step 1)
  form: {
    eyebrow: "Paso 1 de 2",
    title: "Tus Datos",
    subtitle: "Tus datos se guardan automáticamente.",
    legend: "Información Personal",
    fields: {
      name: { label: "Nombre", placeholder: "Juan" },
      surname: { label: "Apellido", placeholder: "Pérez" },
      email: { label: "Correo Electrónico", placeholder: "juan@ejemplo.com" },
      phone: { label: "Teléfono", placeholder: "11 1234-5678" },
      dni: { label: "DNI", placeholder: "12.345.678" }
    },
    autoAccountNote: "Usaremos este email para crear tu cuenta KORA automáticamente y enviarte el seguimiento.",
    submit: "Continuar al Pago",
    submitting: "Procesando...",
    secureNote: "Checkout seguro",
    poweredBy: "Acelerado por MercadoPago"
  },

  // Descuentos y Promo
  promo: {
    title: "¿Tenés un código de descuento?",
    inputPlaceholder: "Ej: KORA26",
    applyBtn: "Aplicar",
    removeBtn: "Quitar",
    emptyError: "Ingresá un código.",
    invalidError: "Código inválido. Verificá e intentá de nuevo.",
    appliedTemplate: "Ahorro de {amount} aplicado al total.",
    labelTemplate: "Código {code} — {pct}% off aplicado"
  },

  // Resumen de la Orden (Side panel o superior en mobile)
  summary: {
    title: "Resumen de Compra",
    mobileToggleShow: "Ver Resumen de Compra",
    mobileToggleHide: "Ocultar Resumen",
    qty: "Cant",
    subtotal: "Subtotal",
    shipping: "Envío",
    freeShipping: "Gratis ✓",
    shippingToFreeTemplate: "Agregá {amount} más para envío gratis",
    promoRowTemplate: "Promo ({pct}% off)",
    total: "Total",
    totalNote: "Este total es exactamente lo que verás en MercadoPago"
  },

  // Pago (Step 2)
  payment: {
    eyebrow: "Paso Final",
    title: "Pago <em>Seguro</em>",
    badge: "Encriptado PCI-DSS",
    totalToPay: "Total a Pagar",
    disclaimer: "Al hacer clic en 'Pagar', aceptás nuestros términos de servicio. Tu pago es procesado de forma segura a través de la infraestructura de MercadoPago.",
    backBtn: "Volver a Detalles"
  },

  // Feedback pages (Success, Pending, Failure)
  success: {
    title: "Order Confirmed",
    eyebrow: "Pago Exitoso",
    displayTitle: "Gracias por <em>elegirnos</em>",
    messageStart: "Tus piezas están siendo preparadas. Hemos enviado la confirmación y el recibo digital a:",
    transactionId: "ID de Transacción",
    btnPrimary: "Seguir Explorando",
    btnSecondary: "Seguir Mi Pedido",
    note: "Una copia de esta confirmación fue enviada a tu correo.",
    footer: "KORA Atelier · NODO Studio"
  },
  
  pending: {
    title: "Pago Pendiente",
    eyebrow: "Esperando Confirmación",
    displayTitle: "Tus piezas están <em>reservadas</em>",
    message: "Recibimos tu solicitud. Una vez que se confirme el pago, comenzaremos a preparar tu paquete.",
    transactionId: "Referencia de Orden",
    nextSteps: {
      title: "Próximos Pasos",
      step1: {
        title: "Revisá tu bandeja de entrada",
        desc: "Enviamos el comprobante y los detalles a tu email."
      },
      step2: {
        title: "Tiempo de proceso",
        desc: "Una vez abonado, puede tomar 24-48 horas hábiles en validarse tu compra."
      }
    },
    btnPrimary: "Seguir Explorando",
    btnSecondary: "Ver Estado de Orden",
    footer: "Dudas? Escribinos a <span class='border-b border-sand-200'>hola@kora.com.ar</span>"
  },

  failure: {
    title: "Error en el Pago",
    eyebrow: "Pago Rechazado",
    displayTitle: "No pudimos <em>procesar</em> el pago",
    fallbackMessage: "El pago no pudo procesarse correctamente por parte de la entidad. Por favor, intentá con otra tarjeta.",
    listPoint1: "No se realizó ningún cargo a tu cuenta.",
    listPoint2: "Tu carrito se mantiene guardado intacto.",
    btnPrimary: "Reintentar Pago",
    btnSecondary: "Volver al Carrito",
    footer: "Dudas sobre pagos? Contactanos: <a href='mailto:hola@kora.com.ar' class='text-petrol hover:underline'>hola@kora.com.ar</a>"
  }
};

// Diccionario de traducción MP -> KORA (Humanizado)
export const MP_REJECTION_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount:
      "Tus fondos son insuficientes o alcanzaste el límite de pago en esta tarjeta.",
  cc_rejected_bad_filled_card_number:
      "El número de la tarjeta ingresado parece incorrecto.",
  cc_rejected_bad_filled_date: "La fecha de vencimiento es incorrecta.",
  cc_rejected_bad_filled_security_code:
      "El código de seguridad (CVV) es incorrecto.",
  cc_rejected_blacklist:
      "No pudimos procesar el pago. Por favor intenta con otra entidad emisora.",
  cc_rejected_call_for_authorize:
      "Debes comunicarte al teléfono autorizado al reverso de la tarjeta para habilitar este pago puntual a MercadoPago.",
  cc_rejected_duplicate_payment:
      "Parece que este pago ya se realizó. Por favor chequea tu email.",
  cc_rejected_high_risk:
      "Tu pago fue declinado por prevención de fraude por parte del banco.",
  cc_rejected_max_attempts:
      "Superaste la cantidad máxima de intentos admitidos para esta tarjeta.",
};
