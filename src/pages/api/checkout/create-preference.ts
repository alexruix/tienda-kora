/**
 * POST /api/checkout/create-preference
 * BeautyHome · NODO Studio
 *
 * Crea una preferencia de MercadoPago con precios validados
 * desde las Content Collections — nunca del cliente.
 *
 * Body esperado: { items: Array<{ id: string, quantity: number }>, buyer: BuyerInfo }
 */

// ── Constantes de Negocio (Sincronizadas con Store/Cart) ──
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 500; // Define aquí el costo base de envío

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = false;

// ── Types ─────────────────────────────────────────────────────────────────────

interface RequestBody {
    items: Array<{ id: string; quantity: number }>;
    buyer: {
        name: string;
        surname: string;
        email: string;
        phone?: string;
        dni?: string;
    };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
    // 1. Validar Content-Type
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
            status: 415,
            headers: { "Content-Type": "application/json" },
        });
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return new Response(JSON.stringify({ error: "Invalid Content-Type" }), { status: 415 });
    }

    // 2. Parsear body
    let body: RequestBody;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }


    const { items, buyer } = body;

    // 3. Validación básica de inputs
    if (!items?.length) {
        return new Response(JSON.stringify({ error: "Cart is empty" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!buyer?.email || !buyer?.name || !buyer?.surname) {
        return new Response(
            JSON.stringify({ error: "Missing required buyer fields: name, surname, email" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 4. Verificar ACCESS_TOKEN
    const accessToken = import.meta.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        console.error("[checkout] MP_ACCESS_TOKEN no configurado");
        return new Response(JSON.stringify({ error: "Payment service misconfigured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    // 5. 🛡️ SEGURIDAD CRÍTICA: Buscar precios desde Content Collections
    //    Nunca aceptamos precios del cliente.
    const productsData = await getCollection("products");
    const productMap = Object.fromEntries(productsData.map((p) => [p.id, { ...p.data, id: p.id }]));
    let subtotal = 0;

    const validatedItems: Array<{
        id: string;
        title: string;
        quantity: number;
        unit_price: number;
        currency_id: string;
        picture_url?: string;
    }> = [];

    for (const item of items) {
        const product = productMap[item.id];
        if (!product) {
            return new Response(
                JSON.stringify({ error: `Product not found: ${item.id}` }),
                { status: 422, headers: { "Content-Type": "application/json" } }
            );
        }

        const qty = Math.min(Math.max(1, Math.floor(item.quantity)), 10); // sanitizar quantity
        const itemTotal = product.price * qty;
        subtotal += itemTotal;
        validatedItems.push({
            id: product.id,
            title: product.name,
            quantity: qty,
            unit_price: product.price,   // precio del servidor, validado por Zod
            currency_id: "ARS",
            ...(product.image && { picture_url: product.image }),
        });
    }

    if (subtotal < FREE_SHIPPING_THRESHOLD) {
        validatedItems.push({
            id: "shipping-fee",
            title: "Standard Shipping",
            quantity: 1,
            unit_price: SHIPPING_COST,
            currency_id: "ARS",
        });
    }

    // 6. Construir la preferencia para MP
    const siteUrl = import.meta.env.SITE_URL ?? "https://beautyhome.nodo.studio";
    const preference = {
        items: validatedItems,
        payer: {
            name: buyer.name,
            surname: buyer.surname,
            email: buyer.email,
            ...(buyer.phone && {
                phone: { number: buyer.phone },
            }),
            ...(buyer.dni && {
                identification: { type: "DNI", number: buyer.dni },
            }),
        },
        back_urls: {
            success: `${siteUrl}/checkout/success`,
            failure: `${siteUrl}/checkout/failure`,
            pending: `${siteUrl}/checkout/pending`,
        },
        auto_return: "approved",       // redirige automáticamente en pagos aprobados
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        statement_descriptor: "BEAUTYHOME",
        expires: true,
        expiration_date_to: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 min
        metadata: {
            source: "beautyhome_web",
        },
    };

    // 7. Llamar a la API de MP
    try {
        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(preference),
        });

        const mpData = await mpRes.json();

        if (!mpRes.ok) {
            const errorData = await mpRes.text();
            console.error("[MP_ERROR]", errorData);
            return new Response(JSON.stringify({ error: "Payment bridge failed" }), { status: 502 });
        }
        

        // 8. Devolver solo el ID y la init_point (URL de pago directo si hace falta)
        return new Response(
            JSON.stringify({
                preferenceId: mpData.id,
                // init_point: mpData.init_point,       // URL externa (Checkout Pro)
                // sandbox_init_point: mpData.sandbox_init_point,
            }),
            {
                status: 201,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (err) {
        console.error("[checkout] Network error calling MP:", err);
        return new Response(JSON.stringify({ error: "Payment service unavailable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }
};