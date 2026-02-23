/**
 * POST /api/webhooks/mercadopago
 * BeautyHome · NODO Studio
 *
 * Webhook handler — production grade.
 *
 * Fixes aplicados:
 *   1. Idempotencia     — procesamiento único por payment_id
 *   2. Status 200 / 500 — 500 en errores técnicos para que MP reintente
 *   3. X-Signature      — validación HMAC del header de MP
 */

import type { APIRoute } from "astro";
import { createHmac } from "node:crypto";

export const prerender = false;

// ── Types ─────────────────────────────────────────────────────────────────────

interface MPNotification {
  action?: string;
  api_version?: string;
  data?: { id: string };
  date_created?: string;
  id?: number;
  live_mode?: boolean;
  type: string;
  user_id?: string;
}

// ── Fix #3: Validación de firma X-Signature ───────────────────────────────────
//
// MP firma cada request con HMAC-SHA256 usando tu MP_WEBHOOK_SECRET.
// El header tiene este formato:
//   x-signature: ts=1704908010,v1=abc123...
//
// La cadena que se firma es: "id:{notification.id};request-id:{x-request-id};ts:{ts};"
// Referencia: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks

function validateSignature(request: Request, rawBody: string, secret: string): boolean {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id") ?? "";

  if (!xSignature || !secret) return false;

  // Parsear el header: "ts=1704908010,v1=abc123..."
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key.trim(), value?.trim() ?? ""];
    })
  );

  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  // Extraer el id de la notificación del body
  let notificationId = "";
  try {
    const body = JSON.parse(rawBody);
    notificationId = String(body?.id ?? "");
  } catch {
    return false;
  }

  // Construir la cadena a firmar según la especificación de MP
  const signedPayload = `id:${notificationId};request-id:${xRequestId};ts:${ts};`;

  // Calcular HMAC-SHA256
  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  // Comparación segura en tiempo constante (evita timing attacks)
  if (expectedSignature.length !== v1.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    mismatch |= expectedSignature.charCodeAt(i) ^ v1.charCodeAt(i);
  }

  return mismatch === 0;
}

// ── Fix #1: Idempotencia ──────────────────────────────────────────────────────
//
// Map en memoria como placeholder. En producción DEBE ser una DB persistente
// (Redis, Postgres, etc.) — este Map se vacía con cada restart del server.
//
// Migración a DB (ejemplo con Prisma):
//
//   async function isAlreadyProcessed(paymentId: string): Promise<boolean> {
//     const existing = await db.processedPayment.findUnique({ where: { paymentId } });
//     return !!existing;
//   }
//
//   async function markAsProcessed(paymentId: string): Promise<void> {
//     await db.processedPayment.create({ data: { paymentId, processedAt: new Date() } });
//   }

const processedPayments = new Map<string, number>(); // paymentId → timestamp Unix

// Limpiar entradas > 24h cada 10 min para evitar memory leaks
setInterval(() => {
  const cutoff = Date.now() - 1000 * 60 * 60 * 24;
  for (const [id, ts] of processedPayments.entries()) {
    if (ts < cutoff) processedPayments.delete(id);
  }
}, 1000 * 60 * 10);

function isAlreadyProcessed(paymentId: string): boolean {
  return processedPayments.has(paymentId);
}

function markAsProcessed(paymentId: string): void {
  processedPayments.set(paymentId, Date.now());
}

// ── MP API ────────────────────────────────────────────────────────────────────

async function fetchPaymentDetails(
  paymentId: string,
  accessToken: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    // Lanzar para que el caller pueda devolver 500 y forzar el reintento de MP
    throw new Error(`MP API ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// ── Business logic ────────────────────────────────────────────────────────────

async function handlePaymentApproved(payment: Record<string, unknown>): Promise<void> {
  const paymentId = String(payment.id);

  // Fix #1: Guard de idempotencia ANTES de cualquier efecto secundario
  if (isAlreadyProcessed(paymentId)) {
    console.log(`[webhook] ${paymentId} ya procesado — ignorando duplicado`);
    return;
  }

  console.log("[webhook] ✅ Procesando pago aprobado:", {
    id: paymentId,
    amount: payment.transaction_amount,
    currency: payment.currency_id,
    payer: (payment.payer as Record<string, unknown>)?.email,
  });

  // TODO: Ejecutar como transacción atómica en tu DB para garantizar consistencia:
  //
  // await db.transaction(async (tx) => {
  //   await tx.orders.create({ data: { paymentId, items: [...], total: ... } });
  //   await tx.stock.decrement({ where: { id: { in: itemIds } }, by: quantities });
  // });
  // await emailService.sendOrderConfirmation({ to: payer.email, orderId: ... });

  // Marcar como procesado SOLO si todo lo anterior fue exitoso.
  // Si algo lanza, este código no corre y MP reintentará.
  markAsProcessed(paymentId);
}

async function handlePaymentFailed(payment: Record<string, unknown>): Promise<void> {
  console.log("[webhook] ❌ Pago rechazado:", {
    id: payment.id,
    status: payment.status,
    detail: payment.status_detail,
  });
  // TODO: Liberar stock reservado, notificar al usuario si aplica
}

async function handlePaymentPending(payment: Record<string, unknown>): Promise<void> {
  console.log("[webhook] ⏳ Pago pendiente:", {
    id: payment.id,
    method: payment.payment_method_id,
  });
  // TODO: Reservar stock, enviar instrucciones de pago (cupón Rapipago, etc.)
}

// ── Handler principal ─────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  const accessToken = import.meta.env.MP_ACCESS_TOKEN;
  const webhookSecret = import.meta.env.MP_WEBHOOK_SECRET;

  if (!accessToken) {
    console.error("[webhook] MP_ACCESS_TOKEN no configurado");
    return new Response("Misconfigured", { status: 500 });
  }

  // Leer el body UNA SOLA VEZ — los ReadableStreams no se pueden releer
  const rawBody = await request.text();

  // ── Fix #3: Validar X-Signature ──────────────────────────────────────────────
  // En TEST, MP puede no enviar el header. Si no hay secret configurado, se omite.
  // En PRODUCCIÓN, configurar MP_WEBHOOK_SECRET es obligatorio.
  if (webhookSecret) {
    const isValid = validateSignature(request, rawBody, webhookSecret);
    if (!isValid) {
      console.warn("[webhook] ⚠️ Firma inválida — posible request falsificado");
      // 401: NO marcar como entregado si la firma no matchea
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // Parsear el body ya leído como texto
  let notification: MPNotification;
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Notificaciones que no son de tipo "payment" → ignorar con 200
  // (MP también envía merchant_order, subscription, etc. — son esperadas)
  if (notification.type !== "payment" || !notification.data?.id) {
    return new Response("OK", { status: 200 });
  }

  const paymentId = notification.data.id;

  // ── Fix #1: Early return si el pago ya fue procesado ──────────────────────────
  if (isAlreadyProcessed(paymentId)) {
    console.log(`[webhook] Notificación duplicada para ${paymentId} — OK sin reprocesar`);
    return new Response("OK", { status: 200 });
  }

  // ── Fix #2: Si el fetch a MP falla, devolver 500 para forzar el reintento ─────
  let payment: Record<string, unknown>;
  try {
    payment = await fetchPaymentDetails(paymentId, accessToken);
  } catch (err) {
    console.error("[webhook] Error al obtener detalles del pago — MP reintentará:", err);
    // 500 → MP aplicará backoff exponencial y reintentará (hasta 5 veces en 24h)
    return new Response("Upstream error", { status: 500 });
  }

  // ── Procesar según el estado del pago ─────────────────────────────────────────
  try {
    const status = payment.status as string;

    switch (status) {
      case "approved":
        await handlePaymentApproved(payment);
        break;
      case "rejected":
      case "cancelled":
        await handlePaymentFailed(payment);
        break;
      case "pending":
      case "in_process":
        await handlePaymentPending(payment);
        break;
      default:
        console.log(`[webhook] Estado no manejado: ${status} — ignorando`);
    }

    // Fix #2: 200 solo si el procesamiento fue exitoso
    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("[webhook] Error en el procesamiento del pago:", err);
    // Fix #2: 500 → MP reintentará. El pago no se pierde.
    return new Response("Processing error", { status: 500 });
  }
};

// MP envía GET al configurar/verificar el endpoint en el panel
export const GET: APIRoute = async () => {
  return new Response("BeautyHome MP Webhook — OK", { status: 200 });
};