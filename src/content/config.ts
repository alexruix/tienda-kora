import { defineCollection, z } from "astro:content";

const products = defineCollection({
  type: "data", // ← CRÍTICO: .json necesita 'data', no 'content'
  schema: z.object({
    id: z.string(),
    name: z.string(),
    subtitle: z.string().optional(),
    slug: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    inStock: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    leadTime: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().int().optional(),
    badges: z.array(z.enum(["featured", "new", "sale", "limited"])).optional(),
    featured: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    details: z.array(z.object({
      label: z.string(),     
      value: z.string()      
    })).optional(),
    variants: z.array(z.object({
      label: z.string(),
      value: z.string(),
      color: z.string(),
      available: z.boolean() // Control de stock por variante
    })).optional(),
    care: z.string().optional(),
    shipping: z.string().optional(),
    metaDescription: z.string().optional(),
    altText: z.string().optional(),
    relatedProducts: z.array(z.string()).optional(),
  }),
});

export const collections = { products };
