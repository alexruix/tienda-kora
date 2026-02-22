// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const productsCollection = defineCollection({
    type: 'data',
    schema: z.object({
        id: z.string(),
        name: z.string(),
        subtitle: z.string().optional(),
        category: z.string(),
        price: z.number(),
        originalPrice: z.number().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        badges: z.array(z.enum(['new', 'sale', 'limited', 'featured'])).optional(),
        image: z.string().optional(),
        aspectRatio: z.enum(['4/5', '1/1', '3/4']).default('4/5'),
        featured: z.boolean().default(false),
        description: z.string().optional(),
        // Si vas a usar variantes (colores), debes tiparlas:
        variants: z.array(z.object({
            label: z.string(),
            value: z.string(),
            color: z.string(),
            available: z.boolean()
        })).optional()
    })
});

export const collections = { 'products': productsCollection };