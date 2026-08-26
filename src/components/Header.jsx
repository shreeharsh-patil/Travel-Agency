import { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GlobalSearchModal from './GlobalSearchModal';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null); // 'destinations' | 'experiences' | 'journeys' | 'currency' | 'profile' | null
    const [user, setUser] = useState(null);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [isMac, setIsMac] = useState(false);
    const [mobileSection, setMobileSection] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { currency, changeCurrency, currencies } = useCurrency();
    const headerRef = useRef(null);
    const dropdownTimeoutRef = useRef(null);

    const activeCurrency = currencies.find((c) => c.code === currency) || currencies[0];

    // Detect OS for keyboard shortcut hint (⌘K vs Ctrl+K)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.navigator) {
            setIsMac(/Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent));
        }
    }, []);

    // Check user session
    const checkUserSession = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data?.user || null);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }, []);

    // Check favorites count
    const checkFavorites = useCallback(async () => {
        try {
            const res = await fetch('/api/favorites');
            if (res.ok) {
                const data = await res.json();
                setFavoritesCount(Array.isArray(data.favorites) ? data.favorites.length : 0);
            } else {
                setFavoritesCount(0);
            }
        } catch {
            setFavoritesCount(0);
        }
    }, []);

    useEffect(() => {
        checkUserSession();
        checkFavorites();
    }, [location.pathname, checkUserSession, checkFavorites]);

    // Listen for custom 'favorites-updated' events across the app
    useEffect(() => {
        const handleFavoritesUpdate = () => {
            checkFavorites();
        };
        window.addEventListener('favorites-updated', handleFavoritesUpdate);
        return () => window.removeEventListener('favorites-updated', handleFavoritesUpdate);
    }, [checkFavorites]);

    // Handle scroll and scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 40);

            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                setScrollProgress(Math.min(100, Math.max(0, (currentScrollY / docHeight) * 100)));
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Global keyboard shortcut for Search (⌘K / Ctrl+K) and Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                setShowSearchModal((prev) => !prev);
            } else if (e.key === 'Escape') {
                setActiveDropdown(null);
                setShowSearchModal(false);
                setMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdowns and mobile menu on route change
    useEffect(() => {
        setActiveDropdown(null);
        setMenuOpen(false);
        setMobileSection(null);
    }, [location.pathname]);

    // Lock body scroll while mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // ignore
        }
        setUser(null);
        setActiveDropdown(null);
        navigate('/');
    };

    const handleMouseEnter = (dropdownKey) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setActiveDropdown(dropdownKey);
    };

    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 220);
    };

    // Route active checks
    const isDestinationsActive =
        location.pathname === '/travel' ||
        location.pathname.startsWith('/places/') ||
        location.pathname.startsWith('/destinations/') ||
        location.pathname === '/suggest-place';

    const isExperiencesActive = [
        '/villas',
        '/private-jets',
        '/hotels',
        '/flights',
        '/experiences',
        '/concierge'
    ].includes(location.pathname);

    const isJourneysActive = [
        '/trips',
        '/plan-trip',
        '/my-trips',
        '/guides',
        '/offers'
    ].includes(location.pathname);

    return (
        <>
            <header
                ref={headerRef}
                className={classNames(
                    "fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out flex items-center justify-between rounded-full backdrop-blur-xl border relative shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
                    {
                        "w-[95%] max-w-7xl py-2.5 sm:py-3 px-3.5 sm:px-6 bg-black/50 border-white/15 hover:border-white/25": !scrolled,
                        "w-[96%] sm:w-[90%] max-w-6xl py-2 sm:py-2.5 px-3.5 sm:px-5 bg-black/85 border-white/20 shadow-2xl": scrolled
                    }
                )}
            >
                {/* Micro Scroll Progress Line on the Header Rim */}
                {scrolled && scrollProgress > 0 && (
                    <div
                        className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent rounded-full opacity-75 pointer-events-none transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(10, scrollProgress))}%`, margin: '0 auto' }}
                    />
                )}

                {/* Left: Brand Logo & Desktop Nav Links */}
                <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                    {/* Brand Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-lg py-1"
                        aria-label="Horizon Travels Home"
                    >
                        {/* Custom Luxury Monogram / Compass Emblem */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#9a7822] via-[#d4af37] to-[#ffe082] p-[1px] shadow-[0_0_12px_rgba(212,175,55,0.35)] group-hover:shadow-[0_0_18px_rgba(212,175,55,0.65)] transition-all duration-300 transform group-hover:scale-105">
                            <div className="w-full h-full bg-[#0e0e11] rounded-full flex items-center justify-center">
                                <svg
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd255] transition-transform duration-500 group-hover:rotate-45"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.4" />
                                    <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" fill="currentColor" fillOpacity="0.85" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="font-serif text-white font-bold tracking-[0.18em] text-[13px] sm:text-[15px] group-hover:text-amber-200 transition-colors uppercase leading-none">
                                HORIZON
                            </span>
                            <span className="text-[7.5px] sm:text-[8.5px] font-mono tracking-[0.25em] text-brand-gold/90 font-medium uppercase mt-0.5 leading-none">
                                TRAVELS
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[12px] font-sans">
                        {/* Home Link */}
                        <Link
                            to="/"
                            className={classNames(
                                "px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative",
                                location.pathname === '/'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Home
                            {location.pathname === '/' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* Destinations Mega Dropdown Trigger */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('destinations')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'destinations' ? null : 'destinations')}
                                className={classNames(
                                    "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative group",
                                    isDestinationsActive || activeDropdown === 'destinations'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'destinations'}
                            >
                                <span>Destinations</span>
                                <svg
                                    className={classNames("w-3 h-3 transition-transform duration-200 opacity-60 group-hover:opacity-100", {
                                        "rotate-180 text-brand-gold": activeDropdown === 'destinations'
                                    })}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                                {isDestinationsActive && (
                                    <motion.span
                                        layoutId="navActiveIndicator"
                                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* Destinations Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'destinations' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-3 w-80 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
                                    >
                                        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                                            <span className="text-[10px] font-mono tracking-widest text-brand-gold/90 uppercase font-semibold">
                                                Curated Sanctuaries
                                            </span>
                                            <Link
                                                to="/travel"
                                                onClick={() => setActiveDropdown(null)}
                                                className="text-[10px] text-white/50 hover:text-white transition-colors"
                                            >
                                                View All →
                                            </Link>
                                        </div>

                                        <div className="py-2 space-y-1">
                                            <Link
                                                to="/travel"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🌴
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        All Sanctuaries & Escapes
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Explore 50+ hand-picked destinations worldwide
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="pt-2 px-2.5 pb-1 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                                Featured Highlights
                                            </div>

                                            <div className="grid grid-cols-2 gap-1 px-1">
                                                <Link
                                                    to="/places/goa"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>🏖️</span>
                                                    <span className="truncate">Goa Coastal</span>
                                                </Link>
                                                <Link
                                                    to="/places/swiss-alps"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>🏔️</span>
                                                    <span className="truncate">Swiss Alps</span>
                                                </Link>
                                                <Link
                                                    to="/places/kyoto"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>⛩️</span>
                                                    <span className="truncate">Kyoto Zen</span>
                                                </Link>
                                                <Link
                                                    to="/places/amalfi-coast"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>🌊</span>
                                                    <span className="truncate">Amalfi Coast</span>
                                                </Link>
                                            </div>

                                            <div className="pt-2 border-t border-white/10 mt-2">
                                                <Link
                                                    to="/suggest-place"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-white/5 hover:bg-brand-gold/15 text-[11px] text-brand-gold transition-colors font-medium"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span>✨</span>
                                                        <span>Suggest a Hidden Sanctuary</span>
                                                    </span>
                                                    <span className="text-[10px]">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Stays & Services Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('experiences')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'experiences' ? null : 'experiences')}
                                className={classNames(
                                    "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative group",
                                    isExperiencesActive || activeDropdown === 'experiences'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'experiences'}
                            >
                                <span>Experiences & Stays</span>
                                <svg
                                    className={classNames("w-3 h-3 transition-transform duration-200 opacity-60 group-hover:opacity-100", {
                                        "rotate-180 text-brand-gold": activeDropdown === 'experiences'
                                    })}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                                {isExperiencesActive && (
                                    <motion.span
                                        layoutId="navActiveIndicator"
                                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* Stays Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'experiences' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-3 w-84 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
                                    >
                                        <div className="px-3 py-2 border-b border-white/10">
                                            <span className="text-[10px] font-mono tracking-widest text-brand-gold/90 uppercase font-semibold">
                                                Bespoke Hospitality & Travel
                                            </span>
                                        </div>

                                        <div className="py-2 grid grid-cols-1 gap-1">
                                            <Link
                                                to="/villas"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🏰
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Luxury Villas & Estates
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Private beachfront & alpine retreats with staff
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/private-jets"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    ✈️
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Private Aviation
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Global on-demand charter jets & private terminals
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/hotels"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🏨
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Boutique Hotels Search
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Five-star rated boutique stays worldwide
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/flights"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🛫
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Flight Route Search
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Live schedules, rates & premium routes
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/experiences"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🧭
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Curated Experiences
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        VIP access, private yacht charters & adventures
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/concierge"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🛎️
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Global Concierge
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        24/7 dedicated lifestyle & booking managers
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Journeys & Planner Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('journeys')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'journeys' ? null : 'journeys')}
                                className={classNames(
                                    "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative group",
                                    isJourneysActive || activeDropdown === 'journeys'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'journeys'}
                            >
                                <span>Journeys & Planner</span>
                                <svg
                                    className={classNames("w-3 h-3 transition-transform duration-200 opacity-60 group-hover:opacity-100", {
                                        "rotate-180 text-brand-gold": activeDropdown === 'journeys'
                                    })}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                                {isJourneysActive && (
                                    <motion.span
                                        layoutId="navActiveIndicator"
                                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* Journeys Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'journeys' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-3 w-80 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
                                    >
                                        <div className="px-3 py-2 border-b border-white/10">
                                            <span className="text-[10px] font-mono tracking-widest text-brand-gold/90 uppercase font-semibold">
                                                Travel Intelligence & Planning
                                            </span>
                                        </div>

                                        <div className="py-2 space-y-1">
                                            <Link
                                                to="/plan-trip"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 transition-all group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-brand-gold text-black font-bold flex items-center justify-center text-sm shadow-md group-hover/item:scale-110 transition-transform">
                                                    ✨
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-brand-gold group-hover/item:text-amber-300">
                                                            AI Trip Planner
                                                        </span>
                                                        <span className="text-[9px] font-mono bg-brand-gold/30 text-brand-gold px-1.5 py-0.5 rounded font-bold uppercase">
                                                            New
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-white/70 leading-tight mt-0.5">
                                                        Build custom day-by-day bespoke itineraries
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/trips"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🗺️
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Curated Itineraries
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Expert-designed vacation blueprints
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/offers"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    🔥
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                            Seasonal Offers
                                                        </span>
                                                        <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                                                            Special
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Limited-time sanctuary packages & upgrades
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/guides"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">
                                                    📖
                                                </span>
                                                <div>
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors">
                                                        Insider Travel Guides
                                                    </div>
                                                    <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                                                        Local wisdom, culture, and luxury tips
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Journal Link */}
                        <Link
                            to="/journal"
                            className={classNames(
                                "px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative",
                                location.pathname === '/journal'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Journal
                            {location.pathname === '/journal' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* Gallery Link */}
                        <Link
                            to="/gallery"
                            className={classNames(
                                "px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative",
                                location.pathname === '/gallery'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Gallery
                            {location.pathname === '/gallery' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* Contact Link */}
                        <Link
                            to="/contact"
                            className={classNames(
                                "px-3 py-1.5 rounded-full transition-all duration-200 uppercase tracking-wider font-medium text-[11px] relative",
                                location.pathname === '/contact'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Contact
                            {location.pathname === '/contact' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>
                    </nav>
                </div>

                {/* Right Utilities: Search, Currency, Favorites, Profile/Login */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {/* Search Trigger Button with ⌘K / Ctrl+K badge */}
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-mono border border-white/10 transition-all duration-200 hover:border-white/25 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        title="Search Sanctuaries, Packages & Guides (Press ⌘K or Ctrl+K)"
                        aria-label="Open search dialog"
                    >
                        <svg
                            className="w-3.5 h-3.5 text-brand-gold/90 group-hover:scale-110 transition-transform"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span className="hidden sm:inline text-[11px] font-sans font-medium text-white/80 group-hover:text-white">
                            Search
                        </span>
                        <kbd className="hidden md:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white/50 border border-white/10 group-hover:text-white/80 group-hover:border-white/20">
                            {isMac ? '⌘K' : 'Ctrl K'}
                        </kbd>
                    </button>

                    {/* Saved / Favorites Counter Button */}
                    <Link
                        to="/favorites"
                        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        title="Saved Sanctuaries"
                        aria-label="Saved sanctuaries wishlist"
                    >
                        <svg
                            className="w-4 h-4 text-white/70 group-hover:text-rose-400 transition-colors"
                            viewBox="0 0 24 24"
                            fill={favoritesCount > 0 ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {favoritesCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg border border-black animate-pulse">
                                {favoritesCount > 9 ? '9+' : favoritesCount}
                            </span>
                        )}
                    </Link>

                    {/* Currency Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'currency' ? null : 'currency')}
                            className={classNames(
                                "flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold",
                                activeDropdown === 'currency' ? "border-brand-gold bg-brand-gold/15 text-brand-gold" : "border-white/10"
                            )}
                            title="Switch display currency"
                            aria-label="Switch display currency"
                            aria-expanded={activeDropdown === 'currency'}
                        >
                            <span className="font-bold">{activeCurrency.symbol}</span>
                            <span className="hidden sm:inline text-[11px] font-medium tracking-tight">{activeCurrency.code}</span>
                            <svg
                                className={classNames("w-2.5 h-2.5 transition-transform duration-200 opacity-60", {
                                    "rotate-180": activeDropdown === 'currency'
                                })}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {activeDropdown === 'currency' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute right-0 top-full mt-2 z-50 w-60 bg-[#121216]/95 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                                >
                                    <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                                        <span className="text-[9px] font-mono text-brand-gold uppercase tracking-widest font-semibold">
                                            Select Currency
                                        </span>
                                        <span className="text-[9px] font-mono text-white/40">
                                            Live FX
                                        </span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto py-1 divide-y divide-white/5 scrollbar-thin">
                                        {currencies.map((c) => {
                                            const isSelected = c.code === currency;
                                            return (
                                                <button
                                                    key={c.code}
                                                    onClick={() => {
                                                        changeCurrency(c.code);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={classNames(
                                                        "w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors group",
                                                        isSelected
                                                            ? "bg-brand-gold/15 text-brand-gold font-bold"
                                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <span className="w-6 text-center font-mono font-bold text-sm text-brand-gold/90">
                                                        {c.symbol}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono text-xs">{c.code}</span>
                                                            {isSelected && (
                                                                <span className="text-[10px] text-brand-gold">✓</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-white/40 block truncate">{c.label}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="px-4 py-2 border-t border-white/10 text-[9px] font-mono text-white/40 bg-black/40 text-center">
                                        Rates synced via European Central Bank API
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile / Auth Hub */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                                className={classNames(
                                    "flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white pl-2 pr-2.5 sm:pr-3 py-1 rounded-full text-xs font-mono border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold",
                                    activeDropdown === 'profile' ? "border-brand-gold bg-brand-gold/15" : "border-white/10"
                                )}
                                aria-label="User profile menu"
                                aria-expanded={activeDropdown === 'profile'}
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-gold to-amber-200 text-black font-bold font-sans text-[11px] flex items-center justify-center shadow-inner">
                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden md:inline max-w-[100px] truncate text-[11px] font-medium text-white/90">
                                    {user.name || user.email?.split('@')[0]}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                            </button>

                            {/* Profile Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'profile' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#121216]/95 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                                    >
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-gold to-amber-200 text-black font-bold text-sm flex items-center justify-center shadow">
                                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold text-white truncate">
                                                        {user.name || user.email?.split('@')[0]}
                                                    </div>
                                                    <div className="text-[10px] text-white/50 font-mono truncate">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            {user.role === 'admin' ? (
                                                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-[9px] font-mono font-bold uppercase">
                                                    Administrator
                                                </span>
                                            ) : (
                                                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-white/10 text-white/70 text-[9px] font-mono uppercase">
                                                    Horizon Club Member
                                                </span>
                                            )}
                                        </div>

                                        <div className="py-2 px-1 text-xs space-y-0.5">
                                            <Link
                                                to="/account"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-sm">👤</span>
                                                <span>Account & Profile</span>
                                            </Link>
                                            <Link
                                                to="/account"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-sm">🎫</span>
                                                <span>My Bookings & Reservations</span>
                                            </Link>
                                            <Link
                                                to="/my-trips"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-sm">🧭</span>
                                                <span>My Planned Itineraries</span>
                                            </Link>
                                            <Link
                                                to="/favorites"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center justify-between px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <span className="text-sm text-rose-400">❤️</span>
                                                    <span>Saved Sanctuaries</span>
                                                </span>
                                                {favoritesCount > 0 && (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300">
                                                        {favoritesCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-brand-gold hover:bg-brand-gold/15 transition-colors font-medium border-t border-white/5 mt-1"
                                                >
                                                    <span className="text-sm">⚡</span>
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                        </div>

                                        <div className="p-2 border-t border-white/10 bg-black/40">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors font-medium"
                                            >
                                                <span>🚪</span>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <Link
                                to="/login"
                                className="hidden md:inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-sans font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/plan-trip"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#d4af37] to-[#e6c66e] text-black hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Plan Trip</span>
                                <span className="text-[10px]">✨</span>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle Button */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        aria-label="Open mobile navigation menu"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Global Search Modal */}
            <GlobalSearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
            />

            {/* Comprehensive Mobile Navigation Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col lg:hidden overflow-hidden"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/50">
                            <Link
                                to="/"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2.5"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#9a7822] via-[#d4af37] to-[#ffe082] p-[1px]">
                                    <div className="w-full h-full bg-[#0e0e11] rounded-full flex items-center justify-center">
                                        <span className="text-[10px] text-brand-gold">✦</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-serif text-white font-bold tracking-widest text-sm uppercase">
                                        HORIZON
                                    </span>
                                    <span className="text-[8px] font-mono tracking-widest text-brand-gold uppercase">
                                        TRAVELS
                                    </span>
                                </div>
                            </Link>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                                    aria-label="Close menu"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Drawer Body with Smooth Scroll */}
                        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                            {/* Mobile Quick Search Bar */}
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    setShowSearchModal(true);
                                }}
                                className="w-full py-3 px-4 rounded-2xl bg-white/10 border border-white/15 text-white/80 text-xs font-mono flex items-center justify-between shadow-inner hover:bg-white/15 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-brand-gold">🔍</span>
                                    <span>Search destinations, stays, flights...</span>
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">
                                    {activeCurrency.symbol} {activeCurrency.code}
                                </span>
                            </button>

                            {/* User Profile Banner in Mobile Menu */}
                            {user ? (
                                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-gold to-amber-200 text-black font-bold flex items-center justify-center text-sm shadow">
                                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-white">
                                                {user.name || user.email?.split('@')[0]}
                                            </div>
                                            <div className="text-[10px] text-white/50 font-mono">
                                                {user.role === 'admin' ? 'Administrator' : 'Club Member'}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/account"
                                        onClick={() => setMenuOpen(false)}
                                        className="text-xs font-mono text-brand-gold hover:underline"
                                    >
                                        Account →
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/15 text-center text-xs font-semibold text-white hover:bg-white/20 transition-colors uppercase tracking-wider"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/plan-trip"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-gold to-amber-300 text-black text-center text-xs font-bold transition-all uppercase tracking-wider shadow-lg"
                                    >
                                        Plan A Trip ✨
                                    </Link>
                                </div>
                            )}

                            {/* Navigation Accordions & Sections */}
                            <div className="space-y-3">
                                {/* Home Link */}
                                <Link
                                    to="/"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Home</span>
                                    <span className="text-white/40 text-xs font-mono">01</span>
                                </Link>

                                {/* Destinations Accordion */}
                                <div className="border-b border-white/5 pb-2">
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'destinations' ? null : 'destinations')}
                                        className="w-full flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors text-left"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>Destinations</span>
                                            {isDestinationsActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </span>
                                        <span className="text-xs text-white/50">{mobileSection === 'destinations' ? '−' : '+'}</span>
                                    </button>

                                    <AnimatePresence>
                                        {mobileSection === 'destinations' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="pl-4 space-y-2 pt-1 pb-3 text-sm text-white/70"
                                            >
                                                <Link
                                                    to="/travel"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block text-brand-gold font-medium py-1"
                                                >
                                                    🌴 All Sanctuaries & Escapes →
                                                </Link>
                                                <Link to="/places/goa" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🏖️ Goa Coastal Retreats
                                                </Link>
                                                <Link to="/places/swiss-alps" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🏔️ Swiss Alps Chalets
                                                </Link>
                                                <Link to="/places/kyoto" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    ⛩️ Kyoto Zen Temples
                                                </Link>
                                                <Link to="/places/amalfi-coast" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🌊 Amalfi Coast
                                                </Link>
                                                <Link
                                                    to="/suggest-place"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block text-brand-gold/90 text-xs pt-1"
                                                >
                                                    ✨ Suggest a Hidden Sanctuary
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Stays & Services Accordion */}
                                <div className="border-b border-white/5 pb-2">
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'services' ? null : 'services')}
                                        className="w-full flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors text-left"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>Experiences & Stays</span>
                                            {isExperiencesActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </span>
                                        <span className="text-xs text-white/50">{mobileSection === 'services' ? '−' : '+'}</span>
                                    </button>

                                    <AnimatePresence>
                                        {mobileSection === 'services' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="pl-4 space-y-2 pt-1 pb-3 text-sm text-white/70"
                                            >
                                                <Link to="/villas" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🏰 Luxury Villas & Estates
                                                </Link>
                                                <Link to="/private-jets" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    ✈️ Private Aviation Charter
                                                </Link>
                                                <Link to="/hotels" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🏨 Boutique Hotel Search
                                                </Link>
                                                <Link to="/flights" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🛫 Premium Flights Search
                                                </Link>
                                                <Link to="/experiences" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🧭 Curated VIP Experiences
                                                </Link>
                                                <Link to="/concierge" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🛎️ 24/7 Global Concierge
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Journeys & Planner Accordion */}
                                <div className="border-b border-white/5 pb-2">
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'journeys' ? null : 'journeys')}
                                        className="w-full flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors text-left"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>Journeys & Planner</span>
                                            {isJourneysActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </span>
                                        <span className="text-xs text-white/50">{mobileSection === 'journeys' ? '−' : '+'}</span>
                                    </button>

                                    <AnimatePresence>
                                        {mobileSection === 'journeys' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="pl-4 space-y-2 pt-1 pb-3 text-sm text-white/70"
                                            >
                                                <Link
                                                    to="/plan-trip"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block text-brand-gold font-medium py-1"
                                                >
                                                    ✨ AI Trip Planner (Custom)
                                                </Link>
                                                <Link to="/trips" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🗺️ Curated Journey Blueprints
                                                </Link>
                                                <Link to="/offers" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    🔥 Seasonal Member Offers
                                                </Link>
                                                <Link to="/guides" onClick={() => setMenuOpen(false)} className="block py-1">
                                                    📖 Insider Travel Guides
                                                </Link>
                                                {user && (
                                                    <Link to="/my-trips" onClick={() => setMenuOpen(false)} className="block text-brand-gold/80 py-1">
                                                        🧭 My Saved Itineraries
                                                    </Link>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Direct Links */}
                                <Link
                                    to="/journal"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Journal & Stories</span>
                                    <span className="text-white/40 text-xs font-mono">04</span>
                                </Link>

                                <Link
                                    to="/gallery"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Visual Gallery</span>
                                    <span className="text-white/40 text-xs font-mono">05</span>
                                </Link>

                                <Link
                                    to="/favorites"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-rose-400">❤️</span>
                                        <span>Saved Wishlist</span>
                                    </span>
                                    {favoritesCount > 0 ? (
                                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                                            {favoritesCount} saved
                                        </span>
                                    ) : (
                                        <span className="text-white/40 text-xs font-mono">06</span>
                                    )}
                                </Link>

                                <Link
                                    to="/contact"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-lg font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Contact Concierge</span>
                                    <span className="text-white/40 text-xs font-mono">07</span>
                                </Link>

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center justify-between py-2 text-lg font-serif text-brand-gold hover:text-amber-300 transition-colors border-b border-white/5"
                                    >
                                        <span>⚡ Admin Console</span>
                                        <span className="text-brand-gold text-xs font-mono">ADMIN</span>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Currency Selection & Logout */}
                            <div className="pt-4 space-y-4">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">
                                        Display Currency
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {currencies.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => changeCurrency(c.code)}
                                                className={classNames(
                                                    "py-1.5 text-center text-xs font-mono rounded-lg transition-colors",
                                                    c.code === currency
                                                        ? "bg-brand-gold text-black font-bold"
                                                        : "bg-white/5 text-white/70 hover:bg-white/10"
                                                )}
                                            >
                                                {c.code}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {user && (
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMenuOpen(false);
                                        }}
                                        className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider hover:bg-rose-500/20 transition-colors"
                                    >
                                        Logout ({user.email.split('@')[0]})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-5 border-t border-white/10 bg-black/60 text-center text-white/40 text-[11px] font-sans">
                            Horizon Luxury Travels • Private Concierge: 24/7 Available
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
