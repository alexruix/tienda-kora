/**
 * BottomNavBar Organism — React Island
 * KORA · NODO Studio
 *
 * Barra de navegación inferior para mobile (oculta en lg+).
 * Tabs: Inicio · Buscar · Favoritos · Carrito · Mi Cuenta
 *
 * Hidratación: client:load (necesario para stores reactivos)
 */
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { cartCount, toggleCart } from "../../store/cart.ts";
import { wishlistCount } from "../../store/wishlist.ts";

interface Tab {
  id: string;
  label: string;
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
}

export function BottomNavBar() {
  const [isMounted, setIsMounted] = useState(false);
  const [activePath, setActivePath] = useState("/");

  const currentCartCount = useStore(cartCount);
  const currentWishlistCount = useStore(wishlistCount);

  useEffect(() => {
    setIsMounted(true);
    setActivePath(window.location.pathname);

    const handleNavigation = () => setActivePath(window.location.pathname);
    document.addEventListener("astro:page-load", handleNavigation);
    return () => document.removeEventListener("astro:page-load", handleNavigation);
  }, []);

  if (!isMounted) return null;

  const tabs: Tab[] = [
    {
      id: "home",
      label: "Inicio",
      href: "/",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: "search",
      label: "Buscar",
      href: "/search",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      )
    },
    {
      id: "wishlist",
      label: "Favoritos",
      href: "/wishlist",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )
    },
    {
      id: "cart",
      label: "Carrito",
      action: toggleCart,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      )
    },
    {
      id: "account",
      label: "Mi Cuenta",
      href: "/account",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  ];

  const getBadge = (id: string) => {
    if (id === "cart" && currentCartCount > 0) return currentCartCount;
    if (id === "wishlist" && currentWishlistCount > 0) return currentWishlistCount;
    return null;
  };

  const isActive = (tab: Tab) => {
    if (tab.id === "cart") return false; // el carrito es modal, nunca "activo"
    return tab.href
      ? (tab.href === "/" ? activePath === "/" : activePath.startsWith(tab.href))
      : false;
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-sand-200 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch h-[56px]">
        {tabs.map((tab) => {
          const badge = getBadge(tab.id);
          const active = isActive(tab);

          const content = (
            <span className="relative flex flex-col items-center justify-center gap-0.5">
              <span className="relative">
                {/* Tint the icon when active */}
                <span className={active ? "text-petrol" : "text-sand-900/40"}>
                  {tab.icon}
                </span>

                {/* Badge */}
                {badge !== null && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-watermelon text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span className={`text-[9px] tracking-[0.04em] uppercase font-medium transition-colors ${active ? "text-petrol" : "text-sand-900/40"}`}>
                {tab.label}
              </span>

              {/* Active dot */}
              {active && (
                <span className="absolute -top-[14px] w-1 h-1 bg-petrol rounded-full" />
              )}
            </span>
          );

          const commonClass = "flex-1 flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 border-none bg-transparent";

          return tab.action ? (
            <button
              key={tab.id}
              onClick={tab.action}
              className={commonClass}
              aria-label={tab.label}
            >
              {content}
            </button>
          ) : (
            <a
              key={tab.id}
              href={tab.href}
              className={`${commonClass} no-underline`}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              {content}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavBar;
