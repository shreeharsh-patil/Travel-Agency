import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GlobalSearchModal from './GlobalSearchModal';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();

    const checkUserSession = () => {
        const token = localStorage.getItem('horizon_token');
        const email = localStorage.getItem('horizon_user_email');
        if (token) {
            setUser({ email: email || 'Traveler' });
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        checkUserSession();
    }, [location.pathname]);

    // Lock body scroll while the mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    // Essential Nav Items
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Travel', path: '/travel' },
        { name: 'Suggest Place', path: '/suggest-place' },
        { name: 'Saved', path: '/favorites' },
        { name: 'Contact', path: '/contact' }
    ];


    const handleLogout = () => {
        localStorage.removeItem('horizon_token');
        localStorage.removeItem('horizon_user_email');
        setUser(null);
    };

    return (
        <>
            <header
                className={classNames(
                    "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out glass-panel rounded-full flex items-center justify-between backdrop-blur-md border border-white/10",
                    {
                        "w-[96%] max-w-7xl py-3 px-4 sm:px-8 bg-black/40": !scrolled,
                        "w-[96%] sm:w-[88%] max-w-6xl py-2.5 px-4 sm:px-6 bg-black/80 shadow-2xl": scrolled
                    }
                )}
            >
                {/* Brand Logo & Essential Nav Links */}
                <div className="flex items-center gap-3 md:gap-8">
                    <Link to="/" className="font-serif text-white font-bold tracking-widest text-xs min-[400px]:text-sm sm:text-lg flex items-center gap-2 group">
                        <span className="whitespace-nowrap">HORIZON TRAVELS</span>
                    </Link>

                    <nav className="hidden lg:flex gap-5 xl:gap-7 text-sm font-sans text-white/80">
                        {navItems.map(item => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={classNames(
                                    "hover:text-white transition-colors uppercase tracking-wide text-[11px] relative group whitespace-nowrap",
                                    { "text-brand-gold font-semibold": location.pathname === item.path }
                                )}
                            >
                                {item.name}
                                {location.pathname === item.path && (
                                    <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-gold"></span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right Utilities: Search, Login, Reserve */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Search Trigger Button */}
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="flex items-center gap-2 bg-white/10 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs font-mono border border-white/10 hover:bg-white/20 transition-colors"
                        title="Search Places (INR ₹)"
                    >
                        <span>🔍</span>
                        <span className="hidden sm:inline">Search</span>
                    </button>

                    {user ? (
                        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                            <span className="text-brand-gold">👤 {user.email.split('@')[0]}</span>
                            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 ml-1">
                                (Logout)
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="hidden md:block text-white text-xs uppercase font-mono font-semibold hover:text-brand-gold transition-colors px-2">
                            Login
                        </Link>
                    )}

                    {/* Mobile Hamburger */}

                    <button
                        onClick={() => setMenuOpen(true)}
                        className="lg:hidden w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Open menu"
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

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl flex flex-col lg:hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <Link to="/" onClick={() => setMenuOpen(false)} className="font-serif text-white font-bold tracking-widest text-lg">
                                <span>HORIZON TRAVELS</span>
                            </Link>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                aria-label="Close menu"
                            >
                                ✕
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
                            <button
                                onClick={() => { setMenuOpen(false); setShowSearchModal(true); }}
                                className="w-full py-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono flex items-center justify-center gap-2"
                            >
                                🔍 Search Places & Packages (₹ INR)
                            </button>

                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * idx, duration: 0.4 }}
                                >
                                    <Link
                                        to={item.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={classNames(
                                            "font-serif text-3xl uppercase tracking-wide transition-colors",
                                            location.pathname === item.path ? "text-brand-gold" : "text-white/80 hover:text-white"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                            >
                                {user ? (
                                    <button
                                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                                        className="mt-2 inline-block px-8 py-3 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold uppercase tracking-widest border border-red-500/40"
                                    >
                                        Logout ({user.email.split('@')[0]})
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="mt-2 inline-block px-8 py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-widest"
                                    >
                                        Login
                                    </Link>
                                )}
                            </motion.div>
                        </nav>

                        <div className="pb-8 text-center text-white/40 text-xs font-sans uppercase tracking-widest">
                            Horizon Travels • INR Currency Standard (₹)
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
