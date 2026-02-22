# 🤎 BeautyHome — E-commerce Atelier

BeautyHome es una plataforma de e-commerce de alta gama para decoración del hogar, desarrollada por **NODO Studio**. El proyecto combina el minimalismo del diseño *Japandi* con la interactividad, materialidad y profundidad del sistema de diseño *Fluent 2* de Microsoft.

Este proyecto está construido con un enfoque de **Arquitectura de Islas (Islands Architecture)**, priorizando un rendimiento estático (SSG) inigualable para el SEO, sin sacrificar la interactividad y persistencia del lado del cliente.

## 🚀 Tecnologías Core

* **Framework Principal:** [Astro 5](https://astro.build/) (Generación estática ultra rápida, enrutamiento dinámico y Content Collections).
* **Interactividad (Islands):** [React 19](https://reactjs.org/) (Para componentes complejos con estado como `CartDrawer` y `SearchBar`).
* **Estado Global:** [Nanostores](https://github.com/nanostores/nanostores) (Manejo de estado agnóstico con persistencia local para comunicar Astro Vanilla JS con React).
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (Motor Oxide, configuración 100% basada en CSS nativo y variables).
* **Validación de Datos:** [Zod](https://zod.dev/) (Tipado estricto para la base de datos de productos).

---

## 🏗️ Arquitectura de Carpetas y Diseño Atómico

El proyecto sigue estrictamente la metodología de **Diseño Atómico (Atomic Design)** para la UI, separando claramente la lógica de negocio de la presentación.

```text
src/
├── components/
│   ├── atoms/          # UI Base (Botones, Badges). Sin estado ni lógica de negocio.
│   ├── molecules/      # Grupos de átomos (ProductCard.astro, SearchBar.jsx, CartItem.jsx).
│   ├── organisms/      # Secciones complejas suscritas al store (Navbar.jsx, CartDrawer.jsx, ProductGrid).
│   └── templates/      # Layouts base (MainLayout.astro, CategoryLayout.astro) que definen la estructura.
├── content/
│   ├── products/       # Base de datos local (Archivos JSON por producto).
│   └── config.ts       # Esquema de validación Zod (Single Source of Truth).
├── pages/              # Enrutamiento basado en archivos de Astro.
│   ├── category/       
│   │   └── [category].astro  # Generador de páginas de categoría dinámicas.
│   ├── product/        
│   │   └── [id].astro        # Generador de PDPs (Product Detail Pages) dinámicos.
│   └── index.astro     # Homepage.
├── store/
│   └── cart.ts         # Cerebro del carrito (Nanostores + PersistentAtom).
└── styles/
    └── global.css      # Motor de Tailwind v4, Design Tokens y utilidades Fluent 2 (Acrylic).