/**
 * Navbar Organism — React Island
 * BeautyHome · NODO Studio
 */

import { useState, useEffect, useRef } from "react";
import SearchBar from "../molecules/SearchBar.jsx";

// (Mantenemos tu objeto MEGA_MENUS intacto aquí arriba)
const MEGA_MENUS = {
  living: {
    columns: [
      {
        title: "Seating",
        links: [
          { label: "Sofas & Sectionals", emoji: "🛋️" },
          { label: "Lounge Chairs", emoji: "💺" },
          { label: "Accent Chairs", emoji: "🪑" },
          { label: "Ottomans & Poufs", emoji: "🪣" },
        ],
      },
      {
        title: "Tables & Storage",
        links: [
          { label: "Coffee Tables", emoji: "🪵" },
          { label: "Sideboards", emoji: "📦" },
          { label: "Shelving Units", emoji: "🗄️" },
          { label: "Plant Stands", emoji: "🪴" },
        ],
      },
      {
        title: "Décor & Lighting",
        links: [
          { label: "Pendant Lights", emoji: "💡" },
          { label: "Floor Lamps", emoji: "🕯️" },
          { label: "Art & Prints", emoji: "🖼️" },
          { label: "Mirrors", emoji: "🪞" },
        ],
      },
    ],
    featured: {
      label: "New Collection",
      title: "Wabi-Sabi\nLiving Series",
      description:
        "Imperfection as beauty — crafted in natural materials and organic forms.",
      href: "/collections/wabi-sabi",
    },
  },
  dining: {
    columns: [
      {
        title: "Tables",
        links: [
          { label: "Dining Tables", emoji: "🪵" },
          { label: "Extendable", emoji: "↔️" },
          { label: "Round Tables", emoji: "⭕" },
          { label: "Bar Tables", emoji: "🍷" },
        ],
      },
      {
        title: "Seating",
        links: [
          { label: "Dining Chairs", emoji: "🪑" },
          { label: "Benches", emoji: "🪑" },
          { label: "Bar Stools", emoji: "🎭" },
        ],
      },
      {
        title: "Storage",
        links: [
          { label: "Sideboards", emoji: "📦" },
          { label: "Wine Racks", emoji: "🍷" },
          { label: "Bar Carts", emoji: "🛒" },
        ],
      },
    ],
    featured: {
      label: "Editorial Pick",
      title: "The Table\nAs Ritual",
      description:
        "Where Japanese craftsmanship meets Nordic simplicity in every shared meal.",
      href: "/collections/dining-ritual",
    },
  },
  workspace: {
    columns: [
      {
        title: "Desks",
        links: [
          { label: "Writing Desks", emoji: "✏️" },
          { label: "Standing Desks", emoji: "↕️" },
          { label: "Corner Desks", emoji: "📐" },
          { label: "Desk Accessories", emoji: "🖊️" },
        ],
      },
      {
        title: "Seating",
        links: [
          { label: "Task Chairs", emoji: "💺" },
          { label: "Lounge Seats", emoji: "🪑" },
        ],
      },
      {
        title: "Storage",
        links: [
          { label: "Bookshelves", emoji: "📚" },
          { label: "Filing", emoji: "🗄️" },
          { label: "Pegboards", emoji: "🔲" },
        ],
      },
    ],
    featured: {
      label: "New Arrivals",
      title: "The Quiet\nWorkspace",
      description:
        "Objects chosen for focus, clarity, and the feeling of a mind at ease.",
      href: "/collections/workspace",
    },
  },
};

export default function Navbar({ cartCount: initialCartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [promoBanner, setPromoBanner] = useState(true);

  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = () => setCartCount((c) => c + 1);
    window.addEventListener("cart:add", handler);
    return () => window.removeEventListener("cart:add", handler);
  }, []);

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
  const openCart = () => window.dispatchEvent(new CustomEvent("cart:open"));

  return (
    <>
      {/* Promo Banner */}
      {promoBanner && (
        <div className="relative z-[1001] bg-watermelon text-white text-center py-[9px] px-4 text-[13px] tracking-[0.04em]">
          <span>
            ✦ &nbsp; Free shipping on orders over $350 — Use code{" "}
            <strong>NODO25</strong> at checkout
          </span>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-f2-sm opacity-70 hover:opacity-100 hover:bg-white/15 transition-all"
            onClick={() => setPromoBanner(false)}
            aria-label="Close promotion banner"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
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
        className={`fixed top-0 left-0 right-0 z-[1000] h-[68px] animate-slide-down transition-all duration-300 ease-fluent ${
          scrolled
            ? "bg-sand-50/95 backdrop-blur-xl backdrop-saturate-150 border-b border-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3),0_2px_16px_rgba(0,0,0,0.06)]"
            : "bg-sand-50/80 backdrop-blur-xl backdrop-saturate-150 border-b border-sand-200/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3),0_1px_0_rgba(229,223,211,0.8)]"
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-8 h-full flex items-center gap-8">
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

          {/* Primary Nav */}
          <nav
            className="hidden md:flex items-center gap-1 mx-auto"
            aria-label="Primary navigation"
          >
            {["living", "dining", "workspace"].map((id) => (
              <button
                key={id}
                className={`relative flex items-center gap-1 font-sans text-[13px] tracking-[0.06em] uppercase px-3 py-1.5 rounded-f2-md transition-colors duration-150 cursor-pointer border-none bg-transparent ${
                  activeMenu === id
                    ? "text-petrol font-medium bg-sand-100 after:absolute after:-bottom-[19px] after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-watermelon after:rounded-[1px]"
                    : "text-sand-900/70 hover:text-sand-900 hover:bg-sand-100 font-normal"
                }`}
                onClick={() => toggleMenu(id)}
                aria-expanded={activeMenu === id}
                aria-haspopup="true"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
                <svg
                  className={`transition-transform duration-[220ms] ease-fluent ${activeMenu === id ? "rotate-180 opacity-100" : "opacity-50"}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
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
              <span
                className="w-1.5 h-1.5 bg-watermelon rounded-full inline-block"
                aria-hidden="true"
              />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <SearchBar />

            <a
              href="/wishlist"
              className="w-10 h-10 rounded-f2-md flex items-center justify-center text-sand-900/70 bg-transparent hover:bg-sand-100 hover:text-sand-900 transition-colors duration-150 active:scale-95 no-underline"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </a>

            <a
              href="/account"
              className="w-10 h-10 rounded-f2-md flex items-center justify-center text-sand-900/70 bg-transparent hover:bg-sand-100 hover:text-sand-900 transition-colors duration-150 active:scale-95 no-underline"
              aria-label="My Account"
              title="My Account"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>

            <button
              className="relative w-10 h-10 rounded-f2-md flex items-center justify-center text-sand-900/70 bg-transparent hover:bg-sand-100 hover:text-sand-900 transition-colors duration-150 active:scale-95 cursor-pointer border-none"
              onClick={openCart}
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-[2px] -right-[2px] min-w-[18px] h-[18px] px-1 bg-watermelon text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-sand-50 animate-cart-pop"
                  aria-hidden="true"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega Menu */}
        {activeMenu && MEGA_MENUS[activeMenu] && (
          <div
            className="absolute top-[68px] left-0 right-0 bg-sand-50/95 backdrop-blur-2xl border-b border-sand-200 shadow-f2-hover origin-top animate-mega-in hidden md:block"
            role="region"
            aria-label={`${activeMenu} submenu`}
          >
            <div className="max-w-[1320px] mx-auto px-8 py-8 grid lg:grid-cols-[repeat(3,1fr)_280px] md:grid-cols-2 gap-8">
              {MEGA_MENUS[activeMenu].columns.map((col) => (
                <div key={col.title}>
                  <p className="text-[10px] tracking-[0.16em] uppercase text-sand-900/50 font-medium mb-4">
                    {col.title}
                  </p>
                  <div className="flex flex-col gap-2">
                    {col.links.map((link) => (
                      <a
                        key={link.label}
                        href={`/${activeMenu}/${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                        className="group flex items-center gap-3 text-[14px] text-sand-900/70 py-2 no-underline cursor-pointer transition-all duration-150 hover:text-petrol hover:translate-x-1"
                      >
                        <span
                          className="w-8 h-8 rounded-f2-sm bg-sand-100 flex items-center justify-center text-[16px] shrink-0 transition-colors duration-150 group-hover:bg-sand-200"
                          aria-hidden="true"
                        >
                          {link.emoji}
                        </span>
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              {/* Featured Card */}
              <div className="md:col-span-2 lg:col-span-1 bg-petrol rounded-f2-lg p-6 text-white relative overflow-hidden">
                <div
                  className="absolute -top-10 -right-10 w-[180px] h-[180px] bg-white/5 rounded-full pointer-events-none"
                  aria-hidden="true"
                ></div>

                <p className="text-[10px] tracking-[0.16em] uppercase text-white/50 mb-3">
                  {MEGA_MENUS[activeMenu].featured.label}
                </p>
                <p className="font-display text-[22px] font-light leading-[1.2] mb-3">
                  {MEGA_MENUS[activeMenu].featured.title
                    .split("\n")
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                </p>
                <p className="text-[13px] text-white/55 leading-[1.6] mb-5">
                  {MEGA_MENUS[activeMenu].featured.description}
                </p>

                <a
                  href={MEGA_MENUS[activeMenu].featured.href}
                  className="inline-block bg-white/10 text-white border border-white/20 text-[11px] tracking-[0.08em] uppercase px-[14px] py-[7px] rounded-f2-md cursor-pointer no-underline font-sans transition-colors duration-150 hover:bg-white/20"
                >
                  Explore →
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
