/**
 * SearchBar Molecule — React Island
 * BeautyHome · NODO Studio
 */

import { useState, useRef, useEffect, useCallback } from 'react';


// Formateador de moneda (puedes ajustarlo a ARS si prefieres)
import { formatCurrency } from '../../utils/formatters.ts';


export default function SearchBar({
    products = [],
    placeholder = 'Buscar piezas...',
    onSearch
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // 1. Lógica de filtrado sobre los productos reales
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const q = query.toLowerCase();
        const res = products.filter(
            (p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
        ).slice(0, 5); // Mostramos máximo 5 resultados rápidos

        setResults(res);
        setIsOpen(res.length > 0);
        setActiveIdx(-1);
    }, [query, products]);

    // 2. Cerrar al hacer clic fuera del buscador
    useEffect(() => {
        function handler(e) {
            if (
                inputRef.current && !inputRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // 3. Navegación por teclado (Accesibilidad)
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            window.location.href = `/product/${results[activeIdx].id}`;
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    }, [isOpen, results, activeIdx]);

    return (
        <div className="relative z-50 group/search" role="search">
            {/* Input Wrapper */}
            <div className="relative flex items-center">
                <svg className="absolute left-3.5 text-sand-900/40 pointer-events-none z-10 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                    ref={inputRef}
                    type="search"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
                    onFocus={() => { if (results.length) setIsOpen(true); }}
                    onKeyDown={handleKeyDown}
                    aria-label="Buscar productos"
                    aria-autocomplete="list"
                    aria-controls="search-listbox"
                    aria-activedescendant={activeIdx >= 0 ? `search-result-${activeIdx}` : undefined}
                    autoComplete="off"
                    // Eliminamos el bezier hardcodeado y usamos ease-fluent
                    className="w-60 focus:w-[280px] h-10 pl-10 pr-9 font-sans text-[13px] bg-sand-100/80 border-[1.5px] border-transparent rounded-full text-sand-900 outline-none placeholder:text-sand-900/50 focus:bg-white focus:border-sand-200 focus:shadow-f2-hover transition-all duration-300 ease-fluent appearance-none [&::-webkit-search-cancel-button]:hidden"
                />

                {/* Botón de limpiar (Solo aparece si hay texto) */}
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
                        aria-label="Limpiar búsqueda"
                        tabIndex={-1}
                        className="absolute right-2.5 w-6 h-6 rounded-full bg-sand-200 flex items-center justify-center text-sand-900/60 hover:bg-sand-300 hover:text-sand-900 f2-transition shrink-0 cursor-pointer border-none"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Results Dropdown (Acrylic Material) */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    id="search-listbox"
                    role="listbox"
                    aria-label="Resultados de búsqueda"
                    className="absolute top-[calc(100%+12px)] right-0 sm:left-0 min-w-[320px] fluent-acrylic rounded-f2-lg overflow-hidden flex flex-col shadow-f2-hover"
                >
                    {results.map((product, i) => (
                        <a
                            key={product.id}
                            href={`/product/${product.id}`}
                            id={`search-result-${i}`}
                            role="option"
                            aria-selected={i === activeIdx}
                            className={`flex items-center gap-3 p-3 no-underline text-sand-900 f2-transition ${i === activeIdx ? 'bg-sand-50/80' : 'hover:bg-sand-50/80'}`}
                        >
                            {/* Renderizado de imagen real o placeholder */}
                            <div className="w-12 h-12 rounded-f2-sm overflow-hidden shrink-0 bg-sand-200">
                                {product.image ? (
                                    <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-sand-200 text-[10px] font-sans text-sand-900/40">NODO</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium truncate">{product.name}</div>
                                <div className="text-[11px] text-sand-900/50 mt-0.5 tracking-wide uppercase truncate">{product.category}</div>
                            </div>
                            <div className="text-[13px] font-medium text-petrol shrink-0">
                                {formatCurrency(product.price)}
                            </div>
                        </a>
                    ))}

                    <button
                        onClick={() => window.location.href = `/search?q=${encodeURIComponent(query)}`}
                        className="w-full text-center p-3.5 text-[12px] font-medium text-watermelon border-t border-sand-200/50 tracking-[0.04em] f2-transition hover:bg-watermelon-light cursor-pointer bg-white"
                    >
                        Ver todos los resultados para "{query}" &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}