import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel'; // 👈 El adaptador

// https://astro.build/config
export default defineConfig({

  // 1. ADAPTADOR: Le dice a Astro cómo hablar con el servidor de destino
  adapter: vercel(),

  // 2. SITE: Necesario para que las URLs de Mercado Pago (webhooks) sean absolutas
  // site: 'https://beautyhome.nodo.studio',

  integrations: [
    react()
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: [
        'enjoyable-shelba-unshapeable.ngrok-free.dev',
        '.ngrok-free.app', // Esto permite cualquier subdominio de ngrok
        'all'              // O simplemente 'all' para desarrollo fluido
      ]
    },
    // Optimización para dependencias de Mercado Pago en el cliente
    optimizeDeps: {
      include: ['@nanostores/react', 'canvas-confetti'],
    },
  },
});