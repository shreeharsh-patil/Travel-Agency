import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [mode, setMode] = useState('login'); // login | signup

    useEffect(() => {
        const token = localStorage.getItem('horizon_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        fetch('/api/auth/me', { headers })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('No session'))))
            .then((data) => {
                if (data.user) {
                    setFormData((prev) => ({ ...prev, email: data.user.email }));
                    setLoggedInUser(data.user);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (loggedInUser && location.state?.from) {
            navigate(location.state.from, { replace: true });
        }
    }, [loggedInUser, location.state, navigate]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('Please enter both your email and password.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (mode === 'signup' && (!formData.name.trim() || formData.password.length < 8)) {
            setError('Please enter your name and a password of at least 8 characters.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Invalid credentials or login service temporarily unavailable.');
            }

            if (data.token) {
                localStorage.setItem('horizon_token', data.token);
            }
            setLoggedInUser(data.user);

            if (location.state?.from) {
                navigate(location.state.from, { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('horizon_token');
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        setLoggedInUser(null);
        setFormData({ name: '', email: '', password: '' });
    };

    const switchMode = () => {
        setMode((m) => (m === 'login' ? 'signup' : 'login'));
        setError('');
    };

    if (loggedInUser) {
        return (
            <section className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-xl bg-[#121214] border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-6"
                >
                    <div className="w-16 h-16 mx-auto rounded-full bg-brand-gold text-black flex items-center justify-center font-serif italic text-2xl font-bold shadow-lg">
                        HT
                    </div>
                    <div>
                        <span className="text-xs font-mono text-brand-gold uppercase tracking-widest block">
                            {loggedInUser.role === 'admin' ? '🛡️ Administrator Access' : 'Verified Member'}
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl mt-2">Welcome, {loggedInUser.name || 'Traveler'}!</h1>
                    </div>
                    <p className="font-sans text-white/60 text-sm">
                        Signed in as <span className="text-white font-mono font-medium">{loggedInUser.email}</span>
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                        {loggedInUser.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="px-7 py-3 bg-brand-gold text-black rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                            >
                                🛡️ Admin Dashboard
                            </Link>
                        )}
                        <Link
                            to="/travel"
                            className="px-7 py-3 bg-white text-black rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors"
                        >
                            Explore Sanctuaries
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white font-sans text-xs font-mono uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/40 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[#0c0c0c] text-white relative overflow-hidden">
            {/* Background Ambient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left: Image */}
                <div className="relative hidden lg:block overflow-hidden">
                    <img
                        src="/images/hotel_lobby.png"
                        alt="Luxury hotel lobby"
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/30 to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12 space-y-4">
                        <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block">
                            Private Travel Portal
                        </span>
                        <h2 className="font-serif text-5xl leading-tight">Sign in to your sanctuary.</h2>
                        <p className="font-sans text-white/60 text-base">
                            Access reservations, manage custom itineraries, and explore verified luxury travel destinations.
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="flex items-start justify-center px-6 pt-32 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div>
                            <span className="font-sans text-brand-gold text-xs tracking-[0.3em] uppercase block mb-4">
                                Member Access
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl">
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="font-sans text-white/60 text-sm mt-2">
                                {mode === 'login'
                                    ? 'Sign in to access your dashboard and bookings.'
                                    : 'Join Horizon Travels to curate your dream journeys.'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-start gap-2.5">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs uppercase font-mono tracking-widest text-white/60">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Shreeharsh Patil"
                                        autoComplete="name"
                                        className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-gold text-sm"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs uppercase font-mono tracking-widest text-white/60">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="traveler@example.com"
                                    autoComplete="email"
                                    className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-brand-gold focus:bg-white/10 text-sm transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs uppercase font-mono tracking-widest text-white/60">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                        className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3.5 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-brand-gold focus:bg-white/10 text-sm transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors text-sm"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '👁️' : '🔒'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 cursor-pointer font-sans text-white/60">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="w-4 h-4 accent-brand-gold bg-transparent border border-white/20 rounded"
                                    />
                                    Remember session
                                </label>
                                <Link to="/contact" className="text-brand-gold hover:text-white transition-colors">
                                    Need assistance?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold text-black font-sans font-bold uppercase tracking-widest py-4 rounded-full hover:bg-white transition-colors disabled:opacity-60 text-xs shadow-lg shadow-brand-gold/10"
                            >
                                {loading
                                    ? 'Authenticating...'
                                    : mode === 'login'
                                    ? 'Sign In to Portal'
                                    : 'Create Member Account'}
                            </button>
                        </form>


                        <p className="text-center font-sans text-xs text-white/50">
                            {mode === 'login' ? (
                                <>
                                    New to Horizon Travels?{' '}
                                    <button
                                        type="button"
                                        onClick={switchMode}
                                        className="text-brand-gold hover:text-white transition-colors font-semibold"
                                    >
                                        Create an account
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={switchMode}
                                        className="text-brand-gold hover:text-white transition-colors font-semibold"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
