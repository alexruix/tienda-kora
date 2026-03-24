export const CategoryContent = {
  common: {
    refine: "Filtrar",
    clearAll: "Limpiar filtros",
    priceRange: "Rango de precio",
    pieces: "piezas",
    home: "Inicio",
    all: "Todo",
    results: "resultados",
    collection: "Colección",
    shop: "Tienda",
    showing: "Mostrando",
    jumpTo: "Ir a la colección"
  },
  // Mapping categories to Hero content
  // We keep the IDs 'living', 'dining', 'workspace' for compatibility with existing product JSONs
  // but map them to KORA pet categories.
  categories: {
    living: {
      id: "living",
      name: "Descanso",
      eyebrow: "Héroes de Diseño & Confort",
      headline: "El arte del <em>descanso</em>",
      sub: "Desde camas 'Nido' de autor hasta colchones antidesgarro para la aventura. Curaduría que equilibra estética y resistencia real.",
      description: "Camas premium, mantas de invierno y colchones reforzados para un descanso profundo."
    },
    dining: {
      id: "dining",
      name: "Alimentación",
      eyebrow: "Artesanal & Premium",
      headline: "Nutrición con <em>clase</em>",
      sub: "Comederos elevados en madera platense y cuencos de acero inoxidable. Higiénicos, duraderos y 100% locales.",
      description: "Objetos que transforman la hora de comer en un ritual de bienestar y diseño."
    },
    workspace: {
      id: "workspace",
      name: "Juego y Paseo",
      eyebrow: "Esenciales Estéticos",
      headline: "Aventura y <em>Diversión</em>",
      sub: "Juguetes de caucho natural, pretales de neoprene y mochilas transportadoras. Lo masivo, seleccionado por su durabilidad.",
      description: "Colección de accesorios para el juego y la salida diaria con el filtro de calidad KORA."
    },
    bienestar: {
      id: "bienestar",
      name: "Higiene y Snacks",
      eyebrow: "Cuidado Funcional",
      headline: "Bienestar <em>Integral</em>",
      sub: "Snacks naturales de Mon Ami y fragancias textiles de Mayors. Para un hogar que huele a perfume y no a 'perro'.",
      description: "Cuidado estético, higiene premium y premios saludables con ingredientes reales."
    }
  },
  // Filters configuration
  filters: {
    category: "Categoría",
    material: "Material",
    style: "Tipo de Producto",
    price: "Precio",
    options: {
      materials: ["Cordura Antidesgarro", "Madera Platense", "Neoprene", "Caucho Natural", "Cerámica", "Acero Inox"],
      styles: ["Diseño de Autor", "Esencial Masivo", "Producción Local", "Premium Funcional"]
    }
  },
  collections: {
    eyebrow: "Catálogo Curado",
    title: "Todas las <em>Colecciones</em>",
    description: "Nuestra selección completa de objetos para el confort de tu compañero. Organizado por uso y diseño: Descanso, Alimentación, Juego y más.",
    conciergeTitle: "Nuestro equipo está acá",
    conciergeSub: "¿No encontrás lo que buscás? Escribinos para una asesoría personalizada sobre piezas para tu hogar.",
    contactBtn: "Contactar Asesoría"
  }
};
