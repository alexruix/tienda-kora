/**
 * SearchBar Molecule — React Island
 * BeautyHome · NODO Studio
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// Mock search data
const MOCK_RESULTS = [
    { id: 'sokaku-sofa', name: 'Sōkaku Sofa', category: 'Living · Seating', price: 2890 },
    { id: 'hana-pendant', name: 'Hana Pendant Light', category: 'Living · Lighting', price: 580 },
    { id: 'nori-desk', name: 'Nori Writing Desk', category: 'Workspace · Desks', price: 1240 },
    { id: 'kuro-table', name: 'Kuro Coffee Table', category: 'Living · Tables', price: 1240 },
    { id: 'shiro-chair', name: 'Shiro Lounge Chair', category: 'Living · Seating', price: 1680 },
    { id: 'yuki-shelf', name: 'Yuki Shelving Unit', category: 'Living · Storage', price: 890 },
    { id: 'hoshi-lamp', name: 'Hoshi Floor Lamp', category: 'Living · Lighting', price: 420 },
    { id: 'mori-sideboard', name: 'Mori Sideboard', category: 'Dining · Storage', price: 2100 },
];

function formatPrice(n) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

export default function SearchBar({ placeholder = 'Buscar piezas...', onSearch }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter results
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        const q = query.toLowerCase();
        const res = MOCK_RESULTS.filter(
            (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        ).slice(0, 5);
        setResults(res);
        setIsOpen(res.length > 0);
        setActiveIdx(-1);
    }, [query]);

    // Close on outside click
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

    // Keyboard navigation
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
            {/* Search Input Wrapper */}
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
                    aria-label="Search products"
                    aria-autocomplete="list"
                    aria-controls="search-listbox"
                    aria-activedescendant={activeIdx >= 0 ? `search-result-${activeIdx}` : undefined}
                    autoComplete="off"
                    className="w-[240px] focus:w-[280px] h-9 pl-10 pr-9 font-sans text-[13px] bg-sand-100 border-[1.5px] border-transparent rounded-full text-sand-900 outline-none placeholder:text-sand-900/50 focus:bg-white focus:border-sand-200 focus:shadow-f2-hover transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] appearance-none [&::-webkit-search-cancel-button]:hidden"
                />

                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
                        aria-label="Clear search"
                        className="absolute right-2.5 w-[22px] h-[22px] rounded-full bg-sand-200 flex items-center justify-center text-sand-900/60 hover:bg-sand-300 hover:text-sand-900 f2-transition shrink-0"
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
                    aria-label="Search results"
                    className="absolute top-[calc(100%+8px)] left-0 min-w-[320px] fluent-acrylic rounded-f2-lg overflow-hidden flex flex-col"
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
                            <div className="w-11 h-11 rounded-f2-md overflow-hidden shrink-0 bg-sand-200">
                                <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                                    <rect width="44" height="44" fill="#E5DFD3" />
                                    <rect x="8" y="22" width="28" height="10" rx="2" fill="#B5A896" />
                                    <rect x="6" y="20" width="32" height="4" rx="1" fill="#CEC5B5" />
                                    <rect x="12" y="32" width="4" height="6" rx="1" fill="#B5A896" />
                                    <rect x="28" y="32" width="4" height="6" rx="1" fill="#B5A896" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium truncate">{product.name}</div>
                                <div className="text-[11px] text-sand-900/50 mt-0.5 tracking-[0.04em] truncate">{product.category}</div>
                            </div>
                            <div className="text-[13px] font-medium text-petrol shrink-0">{formatPrice(product.price)}</div>
                        </a>
                    ))}

                    <button
                        onClick={() => window.location.href = `/search?q=${encodeURIComponent(query)}`}
                        className="w-full text-center p-3 text-[12px] font-medium text-watermelon border-t border-sand-200/50 tracking-[0.04em] f2-transition hover:bg-watermelon-light"
                    >
                        Ver todos los resultados para "{query}" &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}