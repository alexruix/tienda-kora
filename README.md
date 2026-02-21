# 🤎 BeautyHome — E-commerce Atelier

BeautyHome es una plataforma de e-commerce de alta gama para decoración del hogar, desarrollada por **NODO Studio**. El proyecto combina el minimalismo del diseño *Japandi* con la interactividad y profundidad de la fluidez del diseño de Microsoft (*Fluent 2*).

Este proyecto está construido con un enfoque de arquitectura híbrida, priorizando el rendimiento estático sin sacrificar la interactividad del usuario.

## 🚀 Tecnologías Core

* **Framework Principal:** [Astro](https://astro.build/) (Generación estática ultra rápida y enrutamiento).
* **Interactividad (Islands):** [React 18](https://reactjs.org/) (Para componentes dinámicos como el carrito y la barra de navegación).
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (Motor Oxide, configuración 100% basada en CSS nativo).
* **Tipado:** TypeScript / JSDoc.

---

## 🏗️ Arquitectura de la Información y Carpetas

El proyecto sigue estrictamente la metodología de **Diseño Atómico (Atomic Design)** para garantizar la escalabilidad y reusabilidad de los componentes de la interfaz.

[Image of Atomic Design methodology diagram]

```text
src/
├── components/
│   ├── atoms/          # UI Base (Botones, Badges, Inputs). Sin lógica de negocio.
│   ├── molecules/      # Grupos de átomos (ProductCard, SearchBar, CartItem).
│   ├── organisms/      # Secciones complejas con estado (Navbar.jsx, CartDrawer.jsx, ProductGrid.astro).
│   └── templates/      # Layouts base (MainLayout.astro) que definen la estructura SEO y slots.
├── pages/              # Enrutamiento basado en archivos de Astro (index.astro, checkout.astro).
└── styles/
    └── global.css      # Motor de Tailwind v4 y Design Tokens globales.