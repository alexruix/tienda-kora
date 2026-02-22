/**
 * Navbar Organism — React Island
 * BeautyHome · NODO Studio
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from '@nanostores/react';
import { cartCount, toggleCart } from '../../store/cart.ts';
import SearchBar from "../molecules/SearchBar.jsx";

export default function Navbar({ products = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [promoBanner, setPromoBanner] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const currentCartCount = useStore(cartCount);
  const navRef = useRef(null);

  // Evitar problemas de hidratación en SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detectar Scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar mega menu al hacer click afuera
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleMenu = (id) => setActiveMenu((prev) => (prev === id ? null : id));

  // ─── Lógica Dinámica del Menú ───
  // Construimos el árbol de navegación leyendo directamente de los productos JSON
  const menuTree = useMemo(() => {
    const tree = {};

    products.forEach((p) => {
      if (!p.category) return;

      // Separamos "Living · Seating" en ["Living", "Seating"]
      const [mainCat, subCat] = p.category.split(' · ');
      const mainCatId = mainCat.toLowerCase();

      if (!tree[mainCatId]) {
        tree[mainCatId] = {
          id: mainCatId,
          label: mainCat,
          subcategories: new Set(),
          featuredProduct: null
        };
      }

      // Agregamos la subcategoría si existe
      if (subCat) {
        tree[mainCatId].subcategories.add(subCat);
      }

      // Guardamos el primer producto destacado de esta categoría para la Promo Card
      if (p.featured && !tree[mainCatId].featuredProduct) {
        tree[mainCatId].featuredProduct = p;
      }
    });

    // Convertimos los Sets a Arrays y lo ordenamos alfabéticamente
    return Object.values(tree).map(cat => ({
      ...cat,
      subcategories: Array.from(cat.subcategories).sort()
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  // Obtenemos el objeto de la categoría activa para renderizar su panel
  const activeCategoryData = menuTree.find(c => c.id === activeMenu);

  return (
    <>
      {/* Promo Banner */}
      {promoBanner && (
        <div className="relative z-[1001] bg-watermelon text-white text-center py-[9px] px-4 font-sans text-[13px] tracking-[0.04em]">
          <span>
            ✦ &nbsp; Free shipping on orders over $350 — Use code{" "}
            <strong>NODO26</strong> at checkout
          </span>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-f2-sm opacity-70 hover:opacity-100 hover:bg-white/15 transition-all cursor-pointer border-none"
            onClick={() => setPromoBanner(false)}
            aria-label="Close promotion banner"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Navbar Shell */}
      <header
        ref={navRef}
        role="banner"
        className={`fixed top-0 left-0 right-0 z-[1000] h-[68px] animate-slide-down transition-all duration-300 ease-fluent ${scrolled
          ? "bg-sand-50/95 backdrop-blur-xl backdrop-saturate-150 border-b border-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3),0_2px_16px_rgba(0,0,0,0.06)]"
          : "bg-sand-50/80 backdrop-blur-xl backdrop-saturate-150 border-b border-sand-200/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3),0_1px_0_rgba(229,223,211,0.8)]"
          }`}
      >
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 h-full flex items-center gap-4 lg:gap-8">
          {/* Logo */}
          <a
            href="/"
            className="flex flex-col items-start leading-none shrink-0 gap-[2px] no-underline"
            aria-label="BeautyHome by NODO — Home"
          >
            <span className="font-display text-[22px] font-normal tracking-[0.12em] text-petrol uppercase">
              BeautyHome
            </span>
            <span className="font-sans text-[9px] tracking-[0.22em] uppercase text-sand-900/50">
              by NODO Studio
            </span>
          </a>

          {/* Primary Nav Dinámico */}
          <nav
            className="hidden md:flex items-center gap-1 mx-auto"
            aria-label="Primary navigation"
          >
            {menuTree.map((cat) => (
              <button
                key={cat.id}
                className={`relative flex items-center gap-1 font-sans text-[13px] tracking-[0.06em] uppercase px-3 py-1.5 rounded-f2-md transition-colors duration-150 cursor-pointer border-none bg-transparent ${activeMenu === cat.id
                  ? "text-petrol font-medium bg-sand-100 after:absolute after:-bottom-[19px] after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-watermelon after:rounded-[1px]"
                  : "text-sand-900/70 hover:text-sand-900 hover:bg-sand-100 font-normal"
                  }`}
                onClick={() => toggleMenu(cat.id)}
                aria-expanded={activeMenu === cat.id}
                aria-haspopup="true"
              >
                {cat.label}
                <svg
                  className={`transition-transform duration-[220ms] ease-fluent ${activeMenu === cat.id ? "rotate-180 opacity-100" : "opacity-50"}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            ))}
            <a
              href="/collections"
              className="font-sans text-[13px] tracking-[0.06em] uppercase text-sand-900/70 hover:text-sand-900 hover:bg-sand-100 px-3 py-1.5 rounded-f2-md transition-colors duration-150 no-underline"
            >
              Collections
            </a>
            <a
              href="/sale"
              className="relative flex items-center gap-1.5 font-sans text-[13px] tracking-[0.06em] uppercase text-watermelon hover:text-watermelon-hover hover:bg-sand-100 px-3 py-1.5 rounded-f2-md transition-colors duration-150 no-underline"
            >
              Sale
              <span className="w-1.5 h-1.5 bg-watermelon rounded-full inline-block" aria-hidden="true" />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-auto md:ml-0">
            <div className="hidden sm:block">
              <SearchBar products={products} />
            </div>

            <a href="/wishlist" className="hidden sm:flex w-10 h-10 rounded-f2-md items-center justify-center text-sand-900/70 bg-transparent hover:bg-sand-100 hover:text-sand-900 transition-colors duration-150 active:scale-95 no-underline" aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </a>

            <a href="/account" className="hidden sm:flex w-10 h-10 rounded-f2-md items-center justify-center text-sand-900/70 bg-transparent hover:bg-sand-100 hover:text-sand-900 transition-colors duration-150 active:scale-95 no-underline" aria-label="My Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>

            <button
              className="relative w-10 h-10 rounded-f2-md flex items-center justify-center text-sand-900/70 bg-transparent hover:bg-sand-100 hover:text-sand-900 transition-colors duration-150 active:scale-95 cursor-pointer border-none"
              onClick={toggleCart}
              aria-label={`Shopping cart, ${currentCartCount} items`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {isMounted && currentCartCount > 0 && (
                <span
                  className="absolute -top-[2px] -right-[2px] min-w-[18px] h-[18px] px-1 bg-watermelon text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-sand-50 animate-cart-pop"
                  aria-hidden="true"
                >
                  {currentCartCount > 99 ? "99+" : currentCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega Menu Dinámico */}
        {activeMenu && activeCategoryData && (
          <div
            className="absolute top-[68px] left-0 right-0 bg-sand-50/95 backdrop-blur-2xl border-b border-sand-200 shadow-f2-hover origin-top animate-mega-in hidden md:block"
            role="region"
            aria-label={`${activeCategoryData.label} submenu`}
          >
            <div className="max-w-[1320px] mx-auto px-8 py-8 grid lg:grid-cols-[2fr_1fr] gap-12">

              {/* Columna de Enlaces */}
              <div>
                <p className="font-sans text-[10px] tracking-[0.16em] uppercase text-sand-900/50 font-medium mb-6 border-b border-sand-200/60 pb-2">
                  Shop by Category
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {activeCategoryData.subcategories.map((sub) => (
                    <a
                      key={sub}
                      href={`/category/${activeMenu}`} // Opcional: podrías implementar filtros en URL `?sub=${sub}`
                      className="group flex items-center gap-3 font-sans text-[14px] text-sand-900/70 py-1.5 no-underline cursor-pointer transition-all duration-150 hover:text-petrol hover:translate-x-1"
                    >
                      <span className="text-[10px] text-watermelon/50 group-hover:text-watermelon f2-transition">✦</span>
                      {sub}
                    </a>
                  ))}
                  {/* Link "Ver todo" */}
                  <a href={`/category/${activeMenu}`} className="group flex items-center gap-3 font-sans text-[14px] font-medium text-petrol py-1.5 no-underline cursor-pointer transition-all mt-2">
                    View all {activeCategoryData.label} &rarr;
                  </a>
                </div>
              </div>

              {/* Featured Product Dinámico */}
              {activeCategoryData.featuredProduct && (
                <a href={`/product/${activeCategoryData.featuredProduct.id}`} className="group block bg-petrol rounded-f2-lg p-6 text-white relative overflow-hidden shadow-f2-rest hover:shadow-f2-hover f2-transition no-underline">
                  {/* Background Image/Shape */}
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay transition-transform duration-[800ms] ease-fluent group-hover:scale-105">
                    {activeCategoryData.featuredProduct.image ? (
                      <img src={activeCategoryData.featuredProduct.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-sand-300"></div>
                    )}
                  </div>

                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-petrol via-petrol/80 to-petrol/20"></div>

                  <div className="relative z-10 h-full flex flex-col justify-end">
                    <p className="font-sans text-[10px] tracking-[0.16em] uppercase text-watermelon mb-2">
                      Featured Piece
                    </p>
                    <p className="font-display text-[26px] font-light leading-[1.1] mb-2 text-white">
                      {activeCategoryData.featuredProduct.name}
                    </p>
                    <p className="font-sans text-[13px] text-white/70 mb-5 max-w-[80%] line-clamp-2">
                      {activeCategoryData.featuredProduct.subtitle || "A timeless addition to your space."}
                    </p>

                    <div className="inline-block bg-white/10 text-white backdrop-blur-md border border-white/20 text-[11px] tracking-[0.08em] uppercase px-[14px] py-[7px] rounded-f2-md font-sans transition-colors duration-150 group-hover:bg-white w-max group-hover:text-petrol">
                      Shop Now
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}