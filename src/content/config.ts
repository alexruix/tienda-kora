// src/content/config.ts
import { defineCollection, z } from "astro:content";

const productsCollection = defineCollection({
  type: "data",
  schema: z.object({
    // Cambiamos id a opcional o usamos el slug del archivo
    id: z.string().optional(),
    name: z.string(),
    subtitle: z.string().optional(),
    slug: z.string(), // Sincronizado con el JSON
    category: z.string(),
    subcategory: z.string().optional(),
    price: z.number(),
    originalPrice: z.number().optional(),
    inStock: z.boolean().default(true),
    leadTime: z.string().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
    badges: z.array(z.string()).optional(), // Más flexible que el enum rígido
    featured: z.boolean().default(false),
    newArrival: z.boolean().default(false),
    description: z.string().optional(),
    image: z.string().optional(),
    altText: z.string().optional(),
    aspectRatio: z.enum(["4/5", "1/1", "3/4"]).default("4/5"),

    // Estructura de detalles técnicos
    details: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .optional(),

    // Variantes (Correcto, mantenemos tu lógica)
    variants: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          color: z.string(),
          available: z.boolean(),
        }),
      )
      .optional(),

    // Información adicional
    care: z.string().optional(),
    shipping: z.string().optional(),
    metaDescription: z.string().optional(),
    relatedProducts: z.array(z.string()).optional(),
  }),
});

export const collections = { products: productsCollection };
