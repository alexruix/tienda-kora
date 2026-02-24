import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, calculateShipping } from "../../../utils/shipping";
import { calculatePromoDiscount } from "../../../utils/promo";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return new Response(JSON.stringify({ error: "Invalid Content-Type" }), { status: 415 });
    }

    try {
        const body = await request.json();
        const { items, buyer, promoCode } = body;

        const accessToken = import.meta.env.MP_ACCESS_TOKEN;
        const siteUrl = import.meta.env.SITE_URL || "http://localhost:4321";

        // 1. Validar productos
        const productsData = await getCollection("products");
        const productMap = Object.fromEntries(productsData.map((p) => [p.id, { ...p.data, id: p.id }]));

        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = productMap[item.id];
            if (!product) return new Response(JSON.stringify({ error: `Product not found: ${item.id}` }), { status: 422 });

            const qty = Math.min(Math.max(1, Math.floor(item.quantity)), 10);
            subtotal += product.price * qty;

            validatedItems.push({
                id: product.id,
                title: product.name,
                quantity: qty,
                unit_price: product.price,
                currency_id: "ARS",
            });
        }

        // 🏷️ Promo code: descuento validado en servidor (segunda barrera tras el cliente)
        const promoDiscountAmount = calculatePromoDiscount(subtotal, promoCode ?? "");
        if (promoDiscountAmount > 0) {
            // Aplicamos el descuento proporcionalmente entre los items
            // (MP requiere unit_price > 0, no acepta items con precio negativo)
            const factor = (subtotal - promoDiscountAmount) / subtotal;
            for (const item of validatedItems) {
                item.unit_price = Math.round(item.unit_price * factor);
            }
            // Recalculamos el subtotal descontado
            subtotal = Math.round(subtotal * factor);
        }

        if (calculateShipping(subtotal) > 0) {
            validatedItems.push({
                id: "shipping-fee",
                title: "Envío estándar — white glove delivery",
                quantity: 1,
                unit_price: SHIPPING_COST,
                currency_id: "ARS",
            });
        }

        // 2. 🛡️ CONSTRUCCIÓN SEGURA DE LA PREFERENCIA
        // Removemos el notification_url si es localhost porque MP lo rechaza con Error 400
        const isLocal = siteUrl.includes("localhost");

        if (!buyer || typeof buyer.name !== "string" || !buyer.name.trim()
            || typeof buyer.surname !== "string" || !buyer.surname.trim()
            || typeof buyer.email !== "string" || !buyer.email.includes("@")) {
            return new Response(JSON.stringify({ error: "Datos del comprador inválidos" }), { status: 400 });
        }
        // const successUrl = `${siteUrl}/checkout/success`.replace(/([^:]\/)\/+/g, "$1");
        const preferenceBody: any = {
            items: validatedItems,
            payer: {
                name: buyer.name,
                surname: buyer.surname,
                email: buyer.email,
            },
            back_urls: {
                // Aseguramos que la URL sea absoluta y sin errores de formato
                success: `${siteUrl}/checkout/success`.replace(/([^:]\/)\/+/g, "$1"),
                failure: `${siteUrl}/checkout/failure`.replace(/([^:]\/)\/+/g, "$1"),
                pending: `${siteUrl}/checkout/pending`.replace(/([^:]\/)\/+/g, "$1"),
            },
            auto_return: "approved",
            statement_descriptor: "BEAUTYHOME",
            metadata: { source: "beautyhome_web" }
        };

        // Solo agregamos webhook si NO es localhost (O si usas Ngrok)
        if (!isLocal || siteUrl.includes("ngrok") || siteUrl.includes("cloudflare")) {
            preferenceBody.notification_url = `${siteUrl}/api/webhooks/mercadopago`;
        }

        console.log("🚀 Enviando preferencia a MP...");

        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(preferenceBody),
        });

        const mpData = await mpRes.json();

        if (!mpRes.ok) {
            console.error("❌ Error de Mercado Pago:", mpData);
            return new Response(JSON.stringify({
                error: "MP_REJECTED",
                detail: mpData.message || "Invalid data sent to MP"
            }), { status: 400 });
        }

        const shippingCost = calculateShipping(subtotal);
        const total = subtotal + shippingCost;

        return new Response(JSON.stringify({ preferenceId: mpData.id, total }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error("🔥 Error crítico:", err.message);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};