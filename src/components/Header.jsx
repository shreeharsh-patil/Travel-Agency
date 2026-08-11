import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReservationForm from './ReservationForm';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [showReserve, setShowReserve] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll while the mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Dates', path: '/dates' },
        { name: 'Travel', path: '/travel' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Contact', path: '/contact' },
        { name: 'Support', path: '/support' }
    ];

    return (
        <>
            <header
                className={classNames(
                    "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out glass-panel rounded-full flex items-center justify-between backdrop-blur-md border border-white/10",
                    {
                        "w-[95%] max-w-7xl py-3 px-4 sm:px-8 bg-black/20": !scrolled,
                        "w-[95%] sm:w-[80%] max-w-5xl py-3 px-4 sm:px-6 bg-black/60": scrolled
                    }
                )}
            >
                <div className="flex items-center gap-4 md:gap-12">
                    <Link to="/" className="font-serif text-white font-bold tracking-widest text-xs min-[400px]:text-sm sm:text-xl flex items-center gap-2 group">
                        <span className="whitespace-nowrap">HORIZON TRAVELS</span>
                    </Link>
                    <nav className="hidden lg:flex gap-8 text-sm font-sans text-white/80">
                        {navItems.map(item => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={classNames(
                                    "hover:text-white transition-colors uppercase tracking-wide text-xs relative group",
                                    { "text-white font-semibold": location.pathname === item.path }
                                )}
                            >
                                {item.name}
                                {location.pathname === item.path && (
                                    <span className="absolute -bottom-1 left-0 w-full h-px bg-white"></span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                    <Link to="/login" className="hidden md:block text-white text-sm font-semibold hover:text-brand-gold transition-colors">Login</Link>
                    <button
                        onClick={() => setShowReserve(true)}
                        className="bg-white text-black px-4 sm:px-6 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold whitespace-nowrap hover:scale-105 transition-transform hover:bg-brand-gold hover:text-white"
                    >
                        Reserve
                    </button>
                    {/* Hamburger */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {showReserve && <ReservationForm onClose={() => setShowReserve(false)} />}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl flex flex-col lg:hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5">
                            <Link to="/" onClick={() => setMenuOpen(false)} className="font-serif text-white font-bold tracking-widest text-lg">
                                <span>HORIZON TRAVELS</span>
                            </Link>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                aria-label="Close menu"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col items-center justify-center gap-7 px-6">
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
                                            "font-serif text-4xl uppercase tracking-wide transition-colors",
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
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="mt-2 inline-block px-8 py-3 rounded-full bg-white text-black text-sm font-semibold uppercase tracking-widest"
                                >
                                    Login
                                </Link>
                            </motion.div>
                        </nav>

                        <div className="pb-8 text-center text-white/40 text-xs font-sans uppercase tracking-widest">
                            Horizon Travels © 2026
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
