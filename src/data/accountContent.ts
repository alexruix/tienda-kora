export const AccountContent = {
  guest: {
    eyebrow: "✦ Bienvenido",
    title: "Mi Cuenta",
    description: "Iniciá sesión para sincronizar tus favoritos en todos tus dispositivos y gestionar tus compras de manera fluida.",
    wishlistNote: "<strong>Nota sobre la Wishlist:</strong> Tus favoritos actuales se guardan de forma segura en este dispositivo. Al iniciar sesión, se sincronizarán en la nube para que no los pierdas nunca."
  },
  dashboard: {
    welcome: "Bienvenido a tu panel",
    nav: [
      { id: "orders", label: "Mis Pedidos", icon: "📦" },
      { id: "wishlist", label: "Wishlist", icon: "❤️", href: "/wishlist" },
      { id: "profile", label: "Mi Perfil", icon: "👤" },
      { id: "notifs", label: "Notificaciones", icon: "🔔" },
      { id: "addresses", label: "Direcciones", icon: "🏠" },
    ],
    logout: "Cerrar Sesión",
    orders: {
      title: "Mis Pedidos",
      empty: {
        title: "Sin pedidos todavía",
        description: "El historial de tus compras aparecerá acá. Empezá explorando nuestro catálogo.",
        cta: "Explorar Colecciones"
      }
    },
    profile: {
      title: "Mis Datos",
      status: "Guardado de la última compra",
      loading: "Cargando…",
      synced: "Sincronizado",
      fields: {
        name: "Nombre",
        email: "Email",
        phone: "Teléf.",
        dni: "DNI"
      }
    },
    loyalty: {
      eyebrow: "KORA V.I.P",
      title: "Atención Exclusiva",
      description: "Al ser miembro de KORA tenés acceso anticipado a novedades y atención preferencial para todos los pedidos de tu mascota.",
      ctaSupport: "Soporte Premium",
      ctaWishlist: "Ir a Wishlist →"
    }
  }
};
