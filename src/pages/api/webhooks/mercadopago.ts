/**
 * POST /api/webhooks/mercadopago
 * BeautyHome · NODO Studio
 *
 * Webhook handler — production grade.
 *
 * Idempotencia:
 *   - En producción: Upstash Redis (persistente entre instancias serverless).
 *   - En local (sin KV vars): fallback a Map en memoria (solo para dev).
 *
 * Para activar Redis en Vercel:
 *   1. Dashboard Vercel → Storage → Create → Upstash Redis
 *   2. Conectar al proyecto (auto-setea KV_REST_API_URL + KV_REST_API_TOKEN)
 *   3. El webhook usa esas vars automáticamente.
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

// ── Fix #1: Idempotency Layer ─────────────────────────────────────────────────
//
// Abstracción que Elige entre Redis (producción) o Map en memoria (dev local).
// El switch ocurre en runtime según disponibilidad de las env vars.
//
// TTL Redis: 48h — suficiente para cubrir los reintentos de MP (max 5 en 24h)
// y la ventana típica de disputas / chargebacks iniciales.

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 48; // 48h

async function isAlreadyProcessed(paymentId: string): Promise<boolean> {
  const kvUrl = import.meta.env.KV_REST_API_URL;
  const kvToken = import.meta.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    // ── Producción: Upstash Redis ──────────────────────────────────────────────
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: kvUrl, token: kvToken });
      const exists = await redis.exists(`mp:processed:${paymentId}`);
      return exists === 1;
    } catch (err) {
      // Si Redis falla, NO bloqueamos el procesamiento.
      // Es mejor procesar en duplicado que perder un pago.
      console.warn("[webhook] Redis check failed — procesando sin garantía de idempotencia:", err);
      return false;
    }
  }

  // ── Desarrollo local: fallback a Map en memoria ────────────────────────────
  console.warn("[webhook] KV_REST_API_URL/TOKEN no definidos — usando fallback en memoria (solo dev)");
  return devMap.has(paymentId);
}

async function markAsProcessed(paymentId: string): Promise<void> {
  const kvUrl = import.meta.env.KV_REST_API_URL;
  const kvToken = import.meta.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    // ── Producción: Upstash Redis con TTL ─────────────────────────────────────
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: kvUrl, token: kvToken });
      // SET con EX (expiry en segundos) — el key se auto-elimina, sin cleanup manual
      await redis.set(`mp:processed:${paymentId}`, Date.now(), { ex: IDEMPOTENCY_TTL_SECONDS });
    } catch (err) {
      // Log pero no lanzar — el pago ya fue procesado exitosamente
      console.error("[webhook] Error guardando idempotencia en Redis:", err);
    }
    return;
  }

  // ── Desarrollo local: fallback ────────────────────────────────────────────
  devMap.set(paymentId, Date.now());
}

// Solo se usa en dev (sin env vars de KV)
const devMap = new Map<string, number>();

// ── Fix: HMAC Signature Validation ───────────────────────────────────────────

function validateSignature(request: Request, rawBody: string, secret: string): boolean {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id") ?? "";

  if (!xSignature || !secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key.trim(), value?.trim() ?? ""];
    })
  );

  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  let notificationId = "";
  try {
    const body = JSON.parse(rawBody);
    notificationId = String(body?.id ?? "");
  } catch {
    return false;
  }

  const signedPayload = `id:${notificationId};request-id:${xRequestId};ts:${ts};`;
  const expectedSignature = createHmac("sha256", secret).update(signedPayload).digest("hex");

  // Comparación en tiempo constante (evita timing attacks)
  if (expectedSignature.length !== v1.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    mismatch |= expectedSignature.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return mismatch === 0;
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
    throw new Error(`MP API ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// ── Business Logic ────────────────────────────────────────────────────────────

async function handlePaymentApproved(payment: Record<string, unknown>): Promise<void> {
  const paymentId = String(payment.id);

  console.log("[webhook] ✅ Procesando pago aprobado:", {
    id: paymentId,
    amount: payment.transaction_amount,
    currency: payment.currency_id,
    payer: (payment.payer as Record<string, unknown>)?.email,
  });

  // TODO: Ejecutar como transacción atómica en tu DB:
  //
  // await db.transaction(async (tx) => {
  //   await tx.orders.create({ data: { paymentId, total: ..., items: [...] } });
  //   await tx.stock.decrement({ where: { id: { in: itemIds } }, by: quantities });
  // });
  // await emailService.sendOrderConfirmation({ to: payer.email, orderId: ... });

  // Marcar DESPUÉS de que la lógica de negocio fue exitosa
  // Si algo lanzó antes de esta línea, MP reintentará y volveremos a intentar
  await markAsProcessed(paymentId);
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

// ── Main Handler ──────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  const accessToken = import.meta.env.MP_ACCESS_TOKEN;
  const webhookSecret = import.meta.env.MP_WEBHOOK_SECRET;

  if (!accessToken) {
    console.error("[webhook] MP_ACCESS_TOKEN no configurado");
    return new Response("Misconfigured", { status: 500 });
  }

  // Leer el body UNA SOLA VEZ (ReadableStream no se puede releer)
  const rawBody = await request.text();

  // ── Validar X-Signature ───────────────────────────────────────────────────
  // En TEST, MP puede no enviar el header. Si no hay secret, se omite.
  // En PRODUCCIÓN configurar MP_WEBHOOK_SECRET es obligatorio.
  if (webhookSecret) {
    if (!validateSignature(request, rawBody, webhookSecret)) {
      console.warn("[webhook] ⚠️ Firma inválida — posible request falsificado");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let notification: MPNotification;
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Solo manejamos notificaciones de tipo "payment"
  if (notification.type !== "payment" || !notification.data?.id) {
    return new Response("OK", { status: 200 });
  }

  const paymentId = notification.data.id;

  // ── Idempotency Guard — Redis en prod, Map en dev ─────────────────────────
  if (await isAlreadyProcessed(paymentId)) {
    console.log(`[webhook] Notificación duplicada para ${paymentId} — OK sin reprocesar`);
    return new Response("OK", { status: 200 });
  }

  // ── Obtener detalles del pago desde la API de MP ──────────────────────────
  let payment: Record<string, unknown>;
  try {
    payment = await fetchPaymentDetails(paymentId, accessToken);
  } catch (err) {
    console.error("[webhook] Error al obtener detalles — MP reintentará:", err);
    // 500 → MP aplica backoff exponencial y reintenta hasta 5 veces en 24h
    return new Response("Upstream error", { status: 500 });
  }

  // ── Procesar según estado ─────────────────────────────────────────────────
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
        console.log(`[webhook] Estado no manejado: "${status}" — ignorando`);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("[webhook] Error en el procesamiento:", err);
    // 500 → MP reintentará. El flag de idempotencia no se seteó, así que es seguro.
    return new Response("Processing error", { status: 500 });
  }
};

// MP envía GET al configurar/verificar el endpoint en el panel
export const GET: APIRoute = async () =>
  new Response("BeautyHome MP Webhook — OK", { status: 200 });