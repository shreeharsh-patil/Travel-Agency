import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [mode, setMode] = useState('login'); // login | signup

    // Restore an existing session on page load by validating the stored token.
    useEffect(() => {
        const token = localStorage.getItem('ht_token');
        if (!token) return;
        fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Session expired'))))
            .then((data) => {
                setFormData((prev) => ({ ...prev, email: data.user.email }));
                setLoggedIn(true);
            })
            .catch(() => {
                localStorage.removeItem('ht_token');
                localStorage.removeItem('ht_user');
            });
    }, []);

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
        if (mode === 'signup' && formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }
            localStorage.setItem('ht_token', data.token);
            localStorage.setItem('ht_user', JSON.stringify({ email: data.user.email }));
            localStorage.setItem('horizon_token', data.token);
            localStorage.setItem('horizon_user_email', data.user.email);
            setLoggedIn(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const switchMode = () => {
        setMode((m) => (m === 'login' ? 'signup' : 'login'));
        setError('');
    };

    if (loggedIn) {
        return (
            <section className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-xl"
                >
                    <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-white text-black flex items-center justify-center font-serif italic text-2xl">HT</div>
                    <h1 className="font-serif text-4xl md:text-6xl mb-6">Welcome back.</h1>
                    <p className="font-sans text-white/60 text-lg mb-10">
                        You are now signed in as <span className="text-brand-gold font-semibold">{formData.email}</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/travel"
                            className="px-8 py-3 bg-white text-black rounded-full font-sans text-sm font-semibold uppercase tracking-widest hover:bg-brand-gold transition-colors"
                        >
                            Explore Travel
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem('ht_token');
                                localStorage.removeItem('ht_user');
                                setLoggedIn(false);
                            }}
                            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-sans text-sm font-semibold uppercase tracking-widest hover:bg-white/20 transition-colors"
                        >
                            Logout
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
                    <div className="absolute bottom-12 left-12 right-12">
                        <h2 className="font-serif text-5xl leading-tight mb-4">Sign in to your journey.</h2>
                        <p className="font-sans text-white/60 text-lg">
                            Access your reservations, private itineraries, and exclusive member perks.
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="flex items-center justify-center px-6 py-20 lg:py-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-md"
                    >
                        <p className="font-sans text-brand-gold text-sm tracking-[0.3em] uppercase mb-4">Member Access</p>
                        <h1 className="font-serif text-4xl md:text-5xl mb-4">
                            {mode === 'login' ? 'Login' : 'Create Account'}
                        </h1>
                        <p className="font-sans text-white/60 mb-10">
                            {mode === 'login'
                                ? 'Welcome back. Please enter your details.'
                                : 'Join Horizon Travels. Book in minutes.'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/50">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/50">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-white/60">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="w-4 h-4 accent-brand-gold bg-transparent border border-white/20"
                                    />
                                    Remember me
                                </label>
                                <button type="button" className="font-sans text-sm text-brand-gold hover:text-white transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            {error && (
                                <p className="font-sans text-sm text-red-400">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-sans font-bold uppercase tracking-widest py-4 rounded-full hover:bg-brand-gold transition-colors disabled:opacity-60"
                            >
                                {loading
                                    ? 'Please wait…'
                                    : mode === 'login'
                                    ? 'Sign In'
                                    : 'Create Account'}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="font-sans text-xs text-white/40 uppercase tracking-widest">or</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-sans text-sm text-white/80"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.1-3.1C17.4 1.84 14.94.75 12 .75 7.75.75 4.05 3.08 2.26 6.4l3.66 2.84C6.74 6.52 9.14 5.04 12 5.04z" />
                                    <path fill="#4285F4" d="M23.27 12.27c0-.78-.07-1.53-.2-2.25H12v4.51h6.31a5.25 5.25 0 0 1-2.28 3.45l3.53 2.74c2.1-1.94 3.71-4.8 3.71-8.45z" />
                                    <path fill="#FBBC05" d="M5.92 14.76a5.52 5.52 0 0 1 0-3.52L2.26 8.4A11.18 11.18 0 0 0 1.5 12c0 1.27.27 2.47.76 3.6l3.66-2.84z" />
                                    <path fill="#34A853" d="M12 23.25c3.06 0 5.63-1 7.5-2.73l-3.53-2.74c-1 .68-2.29 1.09-3.97 1.09-2.86 0-5.26-1.48-6.54-3.61L2.26 15.6A11.14 11.14 0 0 0 12 23.25z" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-sans text-sm text-white/80"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.48-2.35 1.05-3.11z" />
                                </svg>
                                Apple
                            </button>
                        </div>

                        <p className="text-center font-sans text-sm text-white/50">
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
