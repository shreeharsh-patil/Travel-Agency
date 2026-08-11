import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-40 pb-24 px-4 sm:px-8 flex items-start justify-center">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="relative inline-block">
          <span className="font-serif text-[9rem] sm:text-[12rem] leading-none text-white/10 select-none">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-5xl">🧭</span>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block">
            Lost in Transit
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white">
            This Route Doesn't Exist Yet
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
            The page you're looking for may have been moved, renamed, or never charted.
            Let's get you back to solid ground.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-7 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            to="/travel"
            className="px-7 py-3 rounded-full bg-white/10 text-white border border-white/15 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Explore Destinations
          </Link>
          <Link
            to="/contact"
            className="px-7 py-3 rounded-full bg-white/10 text-white border border-white/15 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
