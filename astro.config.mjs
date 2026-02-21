/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Brand Identity
        watermelon: {
          DEFAULT: "#EE4266",
          hover: "#D63B5B",
          pressed: "#BD3450",
          light: "#FCEBEC", // Para fondos sutiles
        },
        petrol: {
          DEFAULT: "#0B3948", // Tu color de estudio NODO
          dark: "#051C24",
        },
        // Japandi & Nordic Palette
        sand: {
          50: "#F9F8F6", // Fondo principal (Nordic White)
          100: "#F2EFE9", // Fondos secundarios
          200: "#E5DFD3", // Bordes sutiles
          900: "#2D2926", // Texto principal (Anthracite)
        },
      },
      // Fluent 2: Depth & Elevation Tokens
      boxShadow: {
        "f2-rest": "0 2px 4px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)",
        "f2-hover": "0 8px 16px rgba(0,0,0,0.08), 0 0 2px rgba(0,0,0,0.06)",
        "f2-pressed": "0 1px 2px rgba(0,0,0,0.12)",
        "f2-acrylic": "inset 0 0 0 1px rgba(255,255,255,0.3)",
      },
      // Fluent 2: Border Radius (Microsoft standard)
      borderRadius: {
        "f2-sm": "4px",
        "f2-md": "8px",
        "f2-lg": "12px",
        "f2-xl": "20px",
      },
      // Typography: High-legibility stack
      fontFamily: {
        sans: ['"Segoe UI"', "Inter", "system-ui", "sans-serif"],
      },
      // Keyframes para el Motion de Fluent 2
      keyframes: {
        "acrylic-in": {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "acrylic-in": "acrylic-in 0.2s ease-out forwards",
      },
    },
  },
};
