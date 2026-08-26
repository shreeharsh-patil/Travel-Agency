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
    const [activeDropdown, setActiveDropdown] = useState(null); // 'destinations' | 'experiences' | 'journeys' | 'more' | 'currency' | 'profile' | null
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
            setScrolled(currentScrollY > 30);

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
        }, 180);
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

    const isMoreActive = [
        '/journal',
        '/gallery',
        '/contact',
        '/about',
        '/sitemap'
    ].includes(location.pathname);

    return (
        <>
            <header
                ref={headerRef}
                className={classNames(
                    "fixed top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 flex items-center justify-between rounded-full backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] box-border",
                    {
                        "w-[96%] max-w-7xl h-14 sm:h-15 px-3 sm:px-4 lg:px-5 bg-black/75 hover:border-white/25": !scrolled,
                        "w-[96%] sm:w-[92%] max-w-6xl h-13 sm:h-14 px-3 sm:px-4 lg:px-4.5 bg-black/90 border-white/20 shadow-2xl": scrolled
                    }
                )}
            >
                {/* Micro Scroll Progress Line on the Header Rim */}
                {scrolled && scrollProgress > 0 && (
                    <div
                        className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/75 to-transparent rounded-full pointer-events-none transition-all duration-200"
                        style={{ width: `${Math.min(100, Math.max(8, scrollProgress))}%`, margin: '0 auto' }}
                    />
                )}

                {/* Left: Brand Logo & Desktop Nav Links */}
                <div className="flex items-center gap-2 sm:gap-3 xl:gap-4.5 min-w-0 flex-shrink-0">
                    {/* Brand Logo - Compact & Balanced */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-full py-0.5 flex-shrink-0"
                        aria-label="Horizon Travels Home"
                    >
                        {/* Custom Monogram Emblem */}
                        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-gradient-to-tr from-[#9a7822] via-[#d4af37] to-[#ffe082] p-[1px] shadow-[0_0_10px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 transform group-hover:scale-105 flex-shrink-0">
                            <div className="w-full h-full bg-[#0e0e11] rounded-full flex items-center justify-center">
                                <svg
                                    className="w-3.5 h-3.5 text-[#ffd255] transition-transform duration-500 group-hover:rotate-45"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.35" />
                                    <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" fill="currentColor" fillOpacity="0.85" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center whitespace-nowrap">
                            <span className="font-serif text-white font-bold tracking-[0.14em] text-[12px] sm:text-[13.5px] group-hover:text-amber-200 transition-colors uppercase leading-none whitespace-nowrap">
                                HORIZON
                            </span>
                            <span className="text-[7px] sm:text-[7.5px] font-mono tracking-[0.22em] text-brand-gold/90 font-medium uppercase mt-0.5 leading-none whitespace-nowrap">
                                TRAVELS
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links (Visible on >= 992px) */}
                    <nav className="hidden min-[992px]:flex items-center gap-0.5 xl:gap-1 text-[11px] xl:text-[11.5px] 2xl:text-[12px] font-sans whitespace-nowrap">
                        {/* Home Link */}
                        <Link
                            to="/"
                            className={classNames(
                                "px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative",
                                location.pathname === '/'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Home
                            {location.pathname === '/' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* Destinations Dropdown Trigger */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('destinations')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'destinations' ? null : 'destinations')}
                                className={classNames(
                                    "flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative group",
                                    isDestinationsActive || activeDropdown === 'destinations'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'destinations'}
                            >
                                <span className="whitespace-nowrap">Destinations</span>
                                <svg
                                    className={classNames("w-2.5 h-2.5 transition-transform duration-200 opacity-60 group-hover:opacity-100 flex-shrink-0", {
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
                                        className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* Destinations Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'destinations' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-2 w-76 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50"
                                    >
                                        <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                                            <span className="text-[9.5px] font-mono tracking-widest text-brand-gold/90 uppercase font-semibold">
                                                Curated Sanctuaries
                                            </span>
                                            <Link
                                                to="/travel"
                                                onClick={() => setActiveDropdown(null)}
                                                className="text-[9.5px] text-white/50 hover:text-white transition-colors"
                                            >
                                                View All →
                                            </Link>
                                        </div>

                                        <div className="py-1.5 space-y-0.5">
                                            <Link
                                                to="/travel"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/10 transition-colors group/item"
                                            >
                                                <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center text-xs group-hover/item:scale-110 transition-transform flex-shrink-0">
                                                    🌴
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-medium text-white group-hover/item:text-brand-gold transition-colors truncate">
                                                        All Sanctuaries & Escapes
                                                    </div>
                                                    <div className="text-[10px] text-white/50 leading-tight truncate">
                                                        50+ destinations worldwide
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="grid grid-cols-2 gap-1 px-1 pt-1">
                                                <Link
                                                    to="/places/goa"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>🏖️</span>
                                                    <span className="truncate">Goa Coastal</span>
                                                </Link>
                                                <Link
                                                    to="/places/swiss-alps"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>🏔️</span>
                                                    <span className="truncate">Swiss Alps</span>
                                                </Link>
                                                <Link
                                                    to="/places/kyoto"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>⛩️</span>
                                                    <span className="truncate">Kyoto Zen</span>
                                                </Link>
                                                <Link
                                                    to="/places/amalfi-coast"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-colors"
                                                >
                                                    <span>🌊</span>
                                                    <span className="truncate">Amalfi Coast</span>
                                                </Link>
                                            </div>

                                            <div className="pt-1.5 border-t border-white/10 mt-1">
                                                <Link
                                                    to="/suggest-place"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-gold/15 text-[10.5px] text-brand-gold transition-colors font-medium"
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <span>✨</span>
                                                        <span>Suggest a Sanctuary</span>
                                                    </span>
                                                    <span className="text-[10px]">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Experiences & Stays Dropdown Trigger */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('experiences')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'experiences' ? null : 'experiences')}
                                className={classNames(
                                    "flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative group",
                                    isExperiencesActive || activeDropdown === 'experiences'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'experiences'}
                            >
                                <span className="whitespace-nowrap">Experiences & Stays</span>
                                <svg
                                    className={classNames("w-2.5 h-2.5 transition-transform duration-200 opacity-60 group-hover:opacity-100 flex-shrink-0", {
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
                                        className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* Experiences Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'experiences' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-2 w-76 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50"
                                    >
                                        <div className="px-3 py-1.5 border-b border-white/10">
                                            <span className="text-[9.5px] font-mono tracking-widest text-brand-gold/90 uppercase font-semibold">
                                                Luxury Services & Stays
                                            </span>
                                        </div>

                                        <div className="py-1 space-y-0.5">
                                            <Link
                                                to="/villas"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🏰</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-brand-gold truncate">Luxury Villas & Estates</div>
                                                    <div className="text-[10px] text-white/50 truncate">Private estates & chalets</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/private-jets"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">✈️</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-brand-gold truncate">Private Aviation</div>
                                                    <div className="text-[10px] text-white/50 truncate">On-demand global charter jets</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/hotels"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🏨</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-brand-gold truncate">Boutique Hotels</div>
                                                    <div className="text-[10px] text-white/50 truncate">Five-star luxury vetted stays</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/flights"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🛫</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-brand-gold truncate">Flight Search</div>
                                                    <div className="text-[10px] text-white/50 truncate">Premium & first class routes</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/experiences"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🧭</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-brand-gold truncate">Curated Experiences</div>
                                                    <div className="text-[10px] text-white/50 truncate">VIP tours & private charters</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/concierge"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🛎️</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-brand-gold truncate">Global Concierge</div>
                                                    <div className="text-[10px] text-white/50 truncate">24/7 dedicated lifestyle managers</div>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Journeys & Planner Dropdown Trigger */}
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('journeys')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'journeys' ? null : 'journeys')}
                                className={classNames(
                                    "flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative group",
                                    isJourneysActive || activeDropdown === 'journeys'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'journeys'}
                            >
                                <span className="whitespace-nowrap">Journeys & Planner</span>
                                <svg
                                    className={classNames("w-2.5 h-2.5 transition-transform duration-200 opacity-60 group-hover:opacity-100 flex-shrink-0", {
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
                                        className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* Journeys Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'journeys' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-2 w-76 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50"
                                    >
                                        <div className="px-3 py-1.5 border-b border-white/10">
                                            <span className="text-[9.5px] font-mono tracking-widest text-brand-gold/90 uppercase font-semibold">
                                                Itineraries & Intelligence
                                            </span>
                                        </div>

                                        <div className="py-1 space-y-0.5">
                                            <Link
                                                to="/plan-trip"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 transition-all text-xs group/item"
                                            >
                                                <span className="w-6 h-6 rounded-md bg-brand-gold text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    ✨
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-brand-gold group-hover/item:text-amber-300 truncate">
                                                            AI Trip Planner
                                                        </span>
                                                        <span className="text-[8.5px] font-mono bg-brand-gold/30 text-brand-gold px-1 rounded font-bold uppercase">
                                                            New
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-white/60 truncate">
                                                        Custom day-by-day itineraries
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/trips"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🗺️</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white truncate">Curated Itineraries</div>
                                                    <div className="text-[10px] text-white/50 truncate">Handcrafted travel blueprints</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/offers"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">🔥</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-white truncate">Seasonal Offers</span>
                                                        <span className="text-[8.5px] font-mono bg-amber-500/20 text-amber-300 px-1 rounded">
                                                            Special
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-white/50 truncate">Limited sanctuary privileges</div>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/guides"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 text-white hover:text-brand-gold transition-colors text-xs"
                                            >
                                                <span className="text-sm">📖</span>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white truncate">Insider Travel Guides</div>
                                                    <div className="text-[10px] text-white/50 truncate">Local culture & expert tips</div>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Journal Link - Hidden below 1200px (moved to More) */}
                        <Link
                            to="/journal"
                            className={classNames(
                                "hidden min-[1200px]:inline-block px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative",
                                location.pathname === '/journal'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Journal
                            {location.pathname === '/journal' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* Gallery Link - Hidden below 1200px (moved to More) */}
                        <Link
                            to="/gallery"
                            className={classNames(
                                "hidden min-[1200px]:inline-block px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative",
                                location.pathname === '/gallery'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Gallery
                            {location.pathname === '/gallery' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* Contact Link - Hidden below 1280px (moved to More) */}
                        <Link
                            to="/contact"
                            className={classNames(
                                "hidden min-[1280px]:inline-block px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative",
                                location.pathname === '/contact'
                                    ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Contact
                            {location.pathname === '/contact' && (
                                <motion.span
                                    layoutId="navActiveIndicator"
                                    className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>

                        {/* "More" Dropdown Trigger for Tablets/Small Desktops (992px to 1279px) */}
                        <div
                            className="relative min-[1280px]:hidden"
                            onMouseEnter={() => handleMouseEnter('more')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
                                className={classNames(
                                    "flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-150 uppercase tracking-wider font-medium whitespace-nowrap relative group",
                                    isMoreActive || activeDropdown === 'more'
                                        ? "text-brand-gold bg-brand-gold/10 font-semibold"
                                        : "text-white/75 hover:text-white hover:bg-white/5"
                                )}
                                aria-expanded={activeDropdown === 'more'}
                            >
                                <span>More</span>
                                <svg
                                    className={classNames("w-2.5 h-2.5 transition-transform duration-200 opacity-60 group-hover:opacity-100 flex-shrink-0", {
                                        "rotate-180 text-brand-gold": activeDropdown === 'more'
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
                                {isMoreActive && (
                                    <motion.span
                                        layoutId="navActiveIndicator"
                                        className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-brand-gold rounded-full"
                                    />
                                )}
                            </button>

                            {/* More Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'more' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute left-0 top-full mt-2 w-48 bg-[#101014]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 text-xs"
                                    >
                                        <Link
                                            to="/journal"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-2 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span>📰</span>
                                            <span>Journal & Stories</span>
                                        </Link>
                                        <Link
                                            to="/gallery"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-2 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span>🖼️</span>
                                            <span>Visual Gallery</span>
                                        </Link>
                                        <Link
                                            to="/contact"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-2 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span>📞</span>
                                            <span>Contact Concierge</span>
                                        </Link>
                                        <Link
                                            to="/about"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-2 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span>ℹ️</span>
                                            <span>Our Story</span>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>
                </div>

                {/* Right Utilities: Search, Wishlist, Currency, Profile/Login, Mobile Menu */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Search Trigger Button */}
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="h-8 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white px-2.5 sm:px-3 rounded-full text-xs font-mono border border-white/10 transition-all duration-150 hover:border-white/25 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold flex-shrink-0"
                        title="Search Sanctuaries (Press ⌘K or Ctrl+K)"
                        aria-label="Open search dialog"
                    >
                        <svg
                            className="w-3.5 h-3.5 text-brand-gold/90 group-hover:scale-110 transition-transform flex-shrink-0"
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
                        <span className="hidden sm:inline text-[11px] font-sans font-medium text-white/80 group-hover:text-white whitespace-nowrap">
                            Search
                        </span>
                        <kbd className="hidden 2xl:inline-block text-[8.5px] font-mono px-1 py-0.2 rounded bg-black/40 text-white/50 border border-white/10">
                            {isMac ? '⌘K' : 'Ctrl K'}
                        </kbd>
                    </button>

                    {/* Saved / Wishlist Button */}
                    <Link
                        to="/favorites"
                        className="relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold flex-shrink-0"
                        title="Saved Sanctuaries"
                        aria-label="Saved sanctuaries wishlist"
                    >
                        <svg
                            className="w-3.5 h-3.5 text-white/70 group-hover:text-rose-400 transition-colors"
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
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white font-mono text-[8.5px] font-bold rounded-full flex items-center justify-center shadow-lg border border-black animate-pulse">
                                {favoritesCount > 9 ? '9+' : favoritesCount}
                            </span>
                        )}
                    </Link>

                    {/* Currency Switcher */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === 'currency' ? null : 'currency')}
                            className={classNames(
                                "h-8 flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-2.5 rounded-full text-xs font-mono border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold flex-shrink-0",
                                activeDropdown === 'currency' ? "border-brand-gold bg-brand-gold/15 text-brand-gold" : "border-white/10"
                            )}
                            title="Switch display currency"
                            aria-label="Switch display currency"
                            aria-expanded={activeDropdown === 'currency'}
                        >
                            <span className="font-bold text-[11px]">{activeCurrency.symbol}</span>
                            <span className="hidden xl:inline text-[10.5px] font-medium tracking-tight whitespace-nowrap">{activeCurrency.code}</span>
                            <svg
                                className={classNames("w-2 h-2 transition-transform duration-150 opacity-60 flex-shrink-0", {
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
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 z-50 w-56 bg-[#121216]/95 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                                >
                                    <div className="px-3.5 py-2 border-b border-white/10 flex items-center justify-between">
                                        <span className="text-[9px] font-mono text-brand-gold uppercase tracking-widest font-semibold">
                                            Select Currency
                                        </span>
                                        <span className="text-[9px] font-mono text-white/40">
                                            Live FX
                                        </span>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto py-1 divide-y divide-white/5 scrollbar-thin">
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
                                                        "w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs transition-colors",
                                                        isSelected
                                                            ? "bg-brand-gold/15 text-brand-gold font-bold"
                                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <span className="w-5 text-center font-mono font-bold text-xs text-brand-gold/90">
                                                        {c.symbol}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono text-[11px]">{c.code}</span>
                                                            {isSelected && (
                                                                <span className="text-[9px] text-brand-gold">✓</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] text-white/40 block truncate">{c.label}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile / Auth */}
                    {user ? (
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                                className={classNames(
                                    "h-8 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white pl-1.5 pr-2 rounded-full text-xs font-mono border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold flex-shrink-0",
                                    activeDropdown === 'profile' ? "border-brand-gold bg-brand-gold/15" : "border-white/10"
                                )}
                                aria-label="User profile menu"
                                aria-expanded={activeDropdown === 'profile'}
                            >
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-gold to-amber-200 text-black font-bold font-sans text-[10px] flex items-center justify-center flex-shrink-0">
                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden min-[1200px]:inline max-w-[70px] xl:max-w-[90px] truncate text-[11px] font-medium text-white/90 whitespace-nowrap">
                                    {user.name || user.email?.split('@')[0]}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            </button>

                            {/* Profile Dropdown Panel */}
                            <AnimatePresence>
                                {activeDropdown === 'profile' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 z-50 w-60 bg-[#121216]/95 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                                    >
                                        <div className="px-3.5 py-2.5 border-b border-white/10 bg-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-gold to-amber-200 text-black font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold text-white truncate">
                                                        {user.name || user.email?.split('@')[0]}
                                                    </div>
                                                    <div className="text-[9.5px] text-white/50 font-mono truncate">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            {user.role === 'admin' ? (
                                                <span className="mt-1.5 inline-block px-1.5 py-0.2 rounded bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-[8.5px] font-mono font-bold uppercase">
                                                    Administrator
                                                </span>
                                            ) : (
                                                <span className="mt-1.5 inline-block px-1.5 py-0.2 rounded bg-white/10 text-white/70 text-[8.5px] font-mono uppercase">
                                                    Horizon Club Member
                                                </span>
                                            )}
                                        </div>

                                        <div className="py-1 px-1 text-xs space-y-0.5">
                                            <Link
                                                to="/account"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span>👤</span>
                                                <span className="text-[11px]">Account & Profile</span>
                                            </Link>
                                            <Link
                                                to="/account"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span>🎫</span>
                                                <span className="text-[11px]">My Bookings</span>
                                            </Link>
                                            <Link
                                                to="/my-trips"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span>🧭</span>
                                                <span className="text-[11px]">My Itineraries</span>
                                            </Link>
                                            <Link
                                                to="/favorites"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center justify-between px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="text-rose-400">❤️</span>
                                                    <span className="text-[11px]">Saved Wishlist</span>
                                                </span>
                                                {favoritesCount > 0 && (
                                                    <span className="text-[9px] font-mono px-1.5 rounded-full bg-rose-500/20 text-rose-300">
                                                        {favoritesCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-brand-gold hover:bg-brand-gold/15 transition-colors font-medium border-t border-white/5 mt-0.5"
                                                >
                                                    <span>⚡</span>
                                                    <span className="text-[11px]">Admin Dashboard</span>
                                                </Link>
                                            )}
                                        </div>

                                        <div className="p-1.5 border-t border-white/10 bg-black/40">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors font-medium"
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
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                            <Link
                                to="/login"
                                className="hidden min-[992px]:inline-flex items-center justify-center px-2.5 py-1.5 rounded-full text-[11px] font-sans font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/plan-trip"
                                className="h-8 px-2.5 sm:px-3 rounded-full text-[10.5px] sm:text-[11px] font-semibold bg-gradient-to-r from-[#d4af37] to-[#e6c66e] text-black hover:brightness-110 shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                            >
                                <span>Plan Trip</span>
                                <span className="text-[10px]">✨</span>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle Button (Visible on < 992px) */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="min-[992px]:hidden w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold flex-shrink-0"
                        aria-label="Open navigation drawer"
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col min-[992px]:hidden overflow-hidden"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/10 bg-black/60">
                            <Link
                                to="/"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#9a7822] via-[#d4af37] to-[#ffe082] p-[1px]">
                                    <div className="w-full h-full bg-[#0e0e11] rounded-full flex items-center justify-center">
                                        <span className="text-[10px] text-brand-gold">✦</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-serif text-white font-bold tracking-widest text-xs uppercase">
                                        HORIZON
                                    </span>
                                    <span className="text-[7.5px] font-mono tracking-widest text-brand-gold uppercase">
                                        TRAVELS
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                                aria-label="Close menu"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-5">
                            {/* Mobile Quick Search Bar */}
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    setShowSearchModal(true);
                                }}
                                className="w-full py-2.5 px-3.5 rounded-2xl bg-white/10 border border-white/15 text-white/80 text-xs font-mono flex items-center justify-between shadow-inner hover:bg-white/15 transition-colors"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <span className="text-brand-gold">🔍</span>
                                    <span className="truncate">Search sanctuaries, stays...</span>
                                </span>
                                <span className="text-[9.5px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 flex-shrink-0">
                                    {activeCurrency.symbol} {activeCurrency.code}
                                </span>
                            </button>

                            {/* User Profile Banner in Mobile Menu */}
                            {user ? (
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-gold to-amber-200 text-black font-bold flex items-center justify-center text-xs shadow flex-shrink-0">
                                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-white truncate">
                                                {user.name || user.email?.split('@')[0]}
                                            </div>
                                            <div className="text-[9.5px] text-white/50 font-mono truncate">
                                                {user.role === 'admin' ? 'Administrator' : 'Club Member'}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/account"
                                        onClick={() => setMenuOpen(false)}
                                        className="text-xs font-mono text-brand-gold hover:underline flex-shrink-0"
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
                            <div className="space-y-1.5">
                                {/* Home Link */}
                                <Link
                                    to="/"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Home</span>
                                    <span className="text-white/40 text-xs font-mono">01</span>
                                </Link>

                                {/* Destinations Accordion */}
                                <div className="border-b border-white/5 pb-1">
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'destinations' ? null : 'destinations')}
                                        className="w-full flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors text-left"
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
                                                className="pl-3 space-y-1.5 pt-1 pb-2.5 text-xs text-white/70"
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
                                                    className="block text-brand-gold/90 text-[11px] pt-1"
                                                >
                                                    ✨ Suggest a Hidden Sanctuary
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Stays & Services Accordion */}
                                <div className="border-b border-white/5 pb-1">
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'services' ? null : 'services')}
                                        className="w-full flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors text-left"
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
                                                className="pl-3 space-y-1.5 pt-1 pb-2.5 text-xs text-white/70"
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
                                <div className="border-b border-white/5 pb-1">
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'journeys' ? null : 'journeys')}
                                        className="w-full flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors text-left"
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
                                                className="pl-3 space-y-1.5 pt-1 pb-2.5 text-xs text-white/70"
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
                                    className="flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Journal & Stories</span>
                                    <span className="text-white/40 text-xs font-mono">04</span>
                                </Link>

                                <Link
                                    to="/gallery"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Visual Gallery</span>
                                    <span className="text-white/40 text-xs font-mono">05</span>
                                </Link>

                                <Link
                                    to="/favorites"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-rose-400">❤️</span>
                                        <span>Saved Wishlist</span>
                                    </span>
                                    {favoritesCount > 0 ? (
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                                            {favoritesCount} saved
                                        </span>
                                    ) : (
                                        <span className="text-white/40 text-xs font-mono">06</span>
                                    )}
                                </Link>

                                <Link
                                    to="/contact"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-2 text-base font-serif text-white hover:text-brand-gold transition-colors border-b border-white/5"
                                >
                                    <span>Contact Concierge</span>
                                    <span className="text-white/40 text-xs font-mono">07</span>
                                </Link>

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center justify-between py-2 text-base font-serif text-brand-gold hover:text-amber-300 transition-colors border-b border-white/5"
                                    >
                                        <span>⚡ Admin Console</span>
                                        <span className="text-brand-gold text-xs font-mono">ADMIN</span>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Currency Selection & Logout */}
                            <div className="pt-2 space-y-3">
                                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                                    <div className="text-[9.5px] font-mono text-brand-gold uppercase tracking-wider">
                                        Display Currency
                                    </div>
                                    <div className="grid grid-cols-5 gap-1">
                                        {currencies.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => changeCurrency(c.code)}
                                                className={classNames(
                                                    "py-1 text-center text-[11px] font-mono rounded-lg transition-colors",
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
                                        className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider hover:bg-rose-500/20 transition-colors"
                                    >
                                        Logout ({user.email.split('@')[0]})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-3.5 border-t border-white/10 bg-black/60 text-center text-white/40 text-[10px] font-sans">
                            Horizon Luxury Travels • Private Concierge: 24/7 Available
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
