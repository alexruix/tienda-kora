import { defineCollection, z } from 'astro:content';

const productsCollection = defineCollection({
    // 'data' le dice a Astro que vamos a usar JSON o YAML, no Markdown
    type: 'data',
    schema: z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        price: z.number(),
        originalPrice: z.number().optional(), // Puede no tener descuento
        badges: z.array(z.enum(['new', 'sale', 'limited', 'featured'])).optional(),
        image: z.string().optional(),
        aspectRatio: z.enum(['4/5', '1/1', '3/4']).default('4/5'),
        featured: z.boolean().default(false),
    })
});

export const collections = {
    'products': productsCollection,
};