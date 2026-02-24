/**
 * CheckoutForm Organism — React Island
 * BeautyHome · NODO Studio
 *
 * Fixes aplicados:
 *   1. Shipping — SHIPPING_COST importado de utils/shipping.ts (fuente única)
 *   2. Persistencia — customerInfo persistentAtom (nanostores)
 *   3. Hidratación — skeleton estructural en lugar de spinner (sin flicker)
 *   4. DRY — formatPrice de utils/formatters.ts, validadores de utils/validators.ts
 */

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  cartItems,
  cartTotal,
  cartCount,
  hasFreeShipping,
} from "../../store/cart.ts";
import { customerInfo, updateCustomerField } from "../../store/customer.ts";

// Fix #4 — DRY
import { formatPrice } from "../../utils/formatters.ts";
import {
  validateEmail,
  validateDNI,
  validatePhone,
  validateRequired,
  runValidators,
} from "../../utils/validators.ts";

// Fix #1 — Fuente única para shipping
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  calculateShipping,
} from "../../utils/shipping.ts";

// Promo code store
import {
  appliedPromoCode,
  promoDiscount,
  applyPromoCode,
  clearPromoCode,
  PROMO_DISCOUNT_PCT,
} from "../../store/cart.ts";

// ── Field + Input ─────────────────────────────────────────────────────────────

function Field({ label, id, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-sand-900/60"
      >
        {label}
        {required && <span className="text-watermelon ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="font-sans text-[11px] text-watermelon mt-0.5" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

function Input({ id, error, ...props }) {
  return (
    <input
      id={id}
      className={`f2-input font-sans text-[14px] text-sand-900 placeholder:text-sand-900/30 ${error ? "border-b-watermelon/60 focus:border-b-watermelon" : ""
        }`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

// ── Fix #3: Skeleton estructural (sin spinner) ────────────────────────────────

function FormSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="mb-8">
        <div className="h-3 w-24 bg-sand-200 rounded-full mb-3" />
        <div className="h-10 w-64 bg-sand-100 rounded-f2-md mb-2" />
        <div className="h-4 w-80 bg-sand-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="h-[52px] bg-sand-100 rounded-f2-md" />
        <div className="h-[52px] bg-sand-100 rounded-f2-md" />
      </div>
      <div className="h-[52px] bg-sand-100 rounded-f2-md mb-5" />
      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="h-[52px] bg-sand-100 rounded-f2-md" />
        <div className="h-[52px] bg-sand-100 rounded-f2-md" />
      </div>
      <div className="h-[54px] bg-sand-200 rounded-f2-lg" />
    </div>
  );
}

// ── OrderSummary ──────────────────────────────────────────────────────────────

function OrderSummary({ items, subtotal, isFreeShipping, discount }) {
  const shippingCost = calculateShipping(subtotal);
  const total = subtotal + shippingCost - discount;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="bg-white rounded-f2-lg border border-sand-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-sand-200 bg-sand-50">
        <h2 className="font-display text-[20px] font-light text-petrol">Order Summary</h2>
      </div>

      <div className="divide-y divide-sand-100 max-h-[300px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-6 py-4">
            <div className="w-14 h-14 rounded-f2-md bg-sand-100 overflow-hidden shrink-0">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-sand-200" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[13px] font-medium text-sand-900 truncate">{item.name}</p>
              {item.variant && item.variant !== "Standard" && (
                <p className="font-sans text-[11px] text-sand-900/50 mt-0.5">{item.variant}</p>
              )}
              <p className="font-sans text-[11px] text-sand-900/40 mt-0.5">Qty: {item.quantity}</p>
            </div>
            <p className="font-sans text-[13px] font-medium text-petrol shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="px-6 py-5 border-t border-sand-200 space-y-3">
        <div className="flex justify-between text-[13px] font-sans text-sand-900/60">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[13px] font-sans">
          <span className={isFreeShipping ? "text-green-600 font-medium" : "text-sand-900/60"}>
            Shipping
          </span>
          <span className={isFreeShipping ? "text-green-600 font-medium" : "text-sand-900/60"}>
            {isFreeShipping ? "Free ✓" : formatPrice(SHIPPING_COST)}
          </span>
        </div>
        {!isFreeShipping && remaining > 0 && (
          <p className="text-[11px] font-sans text-sand-900/40">
            Agregá {formatPrice(remaining)} más para envío gratis
          </p>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-[13px] font-sans">
            <span className="text-green-600 font-medium">Promo ({PROMO_DISCOUNT_PCT}% off)</span>
            <span className="text-green-600 font-medium">−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline">
          <span className="font-sans text-[14px] font-medium text-sand-900">Total</span>
          <span className="font-display text-[28px] font-light text-petrol leading-none">
            {formatPrice(total)}
          </span>
        </div>
        {/* Refuerza la consistencia con MP — el usuario no se va a sorprender */}
        <p className="text-[10px] font-sans text-sand-900/30 text-right">
          Este total es exactamente lo que verás en MercadoPago
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CheckoutForm() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});

  const itemsMap = useStore(cartItems);
  const subtotal = useStore(cartTotal);
  const freeShipping = useStore(hasFreeShipping);
  const discount = useStore(promoDiscount);
  const promoCode = useStore(appliedPromoCode);

  // Fix #2: form state desde persistentAtom
  const customer = useStore(customerInfo);
  const items = Object.values(itemsMap);

  // Promo code input state (local, no persistido)
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (promoCode) setPromoOpen(true); }, [promoCode]);

  useEffect(() => {
    if (isMounted && items.length === 0) window.location.href = "/";
  }, [isMounted, items.length]);

  const handleApplyPromo = useCallback(() => {
    if (!promoInput.trim()) { setPromoError("Ingresá un código."); return; }
    const valid = applyPromoCode(promoInput.trim());
    if (valid) { setPromoError(""); } else { setPromoError("Código inválido. Verificá e intentá de nuevo."); }
  }, [promoInput]);

  const handleRemovePromo = useCallback(() => {
    clearPromoCode();
    setPromoInput("");
    setPromoError("");
  }, []);

  // Fix #2: cada keystroke escribe al store (localStorage)
  const updateField = useCallback((field, value) => {
    updateCustomerField(field, value);
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }, [errors]);

  // Fix #4: validadores importados, no redefinidos
  const validate = useCallback(() => {
    const e = {};
    const nameErr = runValidators(customer.name, (v) => validateRequired(v, "El nombre"));
    const surErr = runValidators(customer.surname, (v) => validateRequired(v, "El apellido"));
    const emailErr = runValidators(customer.email, validateEmail);
    const phoneErr = validatePhone(customer.phone);
    const dniErr = validateDNI(customer.dni);

    if (nameErr) e.name = nameErr;
    if (surErr) e.surname = surErr;
    if (emailErr) e.email = emailErr;
    if (phoneErr) e.phone = phoneErr;
    if (dniErr) e.dni = dniErr;

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [customer]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) {
      document.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ id, quantity }) => ({ id, quantity })),
          buyer: {
            name: customer.name.trim(),
            surname: customer.surname.trim(),
            email: customer.email.trim().toLowerCase(),
            ...(customer.phone && { phone: customer.phone.trim() }),
            ...(customer.dni && { dni: customer.dni.replace(/\./g, "") }),
          },
          ...(promoCode && { promoCode }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");
      window.location.href = `/checkout/payment?pid=${encodeURIComponent(data.preferenceId)}&amt=${data.total}`;
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Ocurrió un error. Por favor intentá de nuevo.");
      setIsSubmitting(false);
    }
  }, [items, customer, validate]);

  // Fix #3: skeleton en lugar de spinner central
  if (!isMounted) {
    return (
      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-start">
          <FormSkeleton />
          <div className="bg-white rounded-f2-lg border border-sand-200 overflow-hidden animate-pulse">
            <div className="px-6 py-4 border-b border-sand-200">
              <div className="h-6 w-40 bg-sand-100 rounded-f2-md" />
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-14 h-14 bg-sand-100 rounded-f2-md shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-sand-100 rounded-full w-3/4" />
                    <div className="h-3 bg-sand-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-sand-200">
                <div className="h-8 bg-sand-100 rounded-f2-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10 lg:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-start">

        {/* Left: Buyer Form */}
        <div>
          <div className="mb-8">
            <p className="font-sans text-[11px] tracking-[0.18em] uppercase text-sand-900/40 mb-2">Step 1 of 2</p>
            <h1 className="font-display text-[clamp(32px,4vw,44px)] font-light text-petrol leading-[1.1]">Your Details</h1>
            <p className="font-sans text-[14px] text-sand-900/50 mt-2">Tus datos se guardan automáticamente.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Checkout form">
            <fieldset className="border-none p-0 m-0 mb-8">
              <legend className="font-sans text-[11px] tracking-[0.12em] uppercase text-sand-900/40 mb-5 pb-2 border-b border-sand-200 w-full">
                Personal Information
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <Field label="Nombre" id="name" error={errors.name} required>
                  <Input id="name" type="text" value={customer.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Juan" autoComplete="given-name" error={errors.name} />
                </Field>
                <Field label="Apellido" id="surname" error={errors.surname} required>
                  <Input id="surname" type="text" value={customer.surname} onChange={(e) => updateField("surname", e.target.value)} placeholder="García" autoComplete="family-name" error={errors.surname} />
                </Field>
              </div>

              <div className="mb-5">
                <Field label="Email" id="email" error={errors.email} required>
                  <Input id="email" type="email" value={customer.email} onChange={(e) => updateField("email", e.target.value)} placeholder="juan@ejemplo.com" autoComplete="email" inputMode="email" error={errors.email} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Teléfono" id="phone" error={errors.phone}>
                  <Input id="phone" type="tel" value={customer.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="11 1234-5678" autoComplete="tel" inputMode="tel" error={errors.phone} />
                </Field>
                <Field label="DNI" id="dni" error={errors.dni}>
                  <Input id="dni" type="text" value={customer.dni} onChange={(e) => updateField("dni", e.target.value)} placeholder="12.345.678" inputMode="numeric" maxLength={10} error={errors.dni} />
                </Field>
              </div>
            </fieldset>

            {/* ── Promo Code ── */}
            <div className="mb-8 border border-sand-200 rounded-f2-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPromoOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-sand-50 hover:bg-sand-100 transition-colors text-left border-none cursor-pointer"
                aria-expanded={promoOpen}
              >
                <span className="font-sans text-[13px] text-sand-900/70">
                  {promoCode
                    ? <span className="text-green-600 font-medium flex items-center gap-2"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Código <strong>{promoCode}</strong> — {PROMO_DISCOUNT_PCT}% off aplicado</span>
                    : "¿Tenés un código de descuento?"}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-sand-900/40 transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
              </button>

              {promoOpen && (
                <div className="px-4 py-4 border-t border-sand-200 bg-white">
                  {promoCode ? (
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-[13px] text-green-600">
                        Ahorro de <strong>{formatPrice(discount)}</strong> aplicado al total.
                      </p>
                      <button type="button" onClick={handleRemovePromo}
                        className="font-sans text-[12px] text-watermelon hover:opacity-70 bg-transparent border-none cursor-pointer">
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="promo-code" type="text" value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                        placeholder="Ej: NODO26" maxLength={20} autoComplete="off" spellCheck={false}
                        className="flex-1 px-3 py-2 rounded-f2-md border border-sand-200 bg-white font-sans text-[13px] text-sand-900 tracking-widest uppercase focus:outline-none focus:border-petrol transition-colors"
                        aria-label="Código de descuento"
                        aria-describedby={promoError ? "promo-error" : undefined}
                      />
                      <button type="button" onClick={handleApplyPromo}
                        className="px-4 py-2 bg-petrol text-white rounded-f2-md font-sans text-[12px] tracking-[0.06em] uppercase border-none cursor-pointer hover:bg-petrol/90 transition-colors shrink-0">
                        Aplicar
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p id="promo-error" role="alert" className="font-sans text-[12px] text-watermelon mt-2">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            {apiError && (
              <div className="bg-watermelon/5 border border-watermelon/30 rounded-f2-md px-4 py-3 mb-6" role="alert">
                <p className="font-sans text-[13px] text-watermelon flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {apiError}
                </p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full h-[54px] bg-petrol text-white rounded-f2-lg font-sans text-[13px] tracking-[0.08em] uppercase font-medium flex items-center justify-center gap-3 border-none cursor-pointer transition-all duration-200 hover:bg-petrol/90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Procesando...</>
              ) : (
                <>Continue to Payment <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><path d="M12 5l7 7-7 7" /></svg></>
              )}
            </button>

            <div className="flex items-center justify-center gap-6 mt-5">
              <span className="flex items-center gap-1.5 text-[11px] text-sand-900/40 font-sans">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Secure checkout
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-sand-900/40 font-sans">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Powered by MercadoPago
              </span>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:sticky lg:top-24">
          <OrderSummary items={items} subtotal={subtotal} isFreeShipping={freeShipping} discount={discount} />
        </div>
      </div>
    </div>
  );
}