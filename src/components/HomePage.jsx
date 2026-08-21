import React from 'react';
import PricingSection from './PricingSection';
import BentoGrid from './BentoGrid';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <main className="w-full bg-[#0c0c0c]">
            <section className="relative min-h-[72svh] md:min-h-[82svh] overflow-hidden bg-black">
                <img
                    src="/images/amalfi_scenic.png"
                    alt="Amalfi Coast at golden hour"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
                <div className="relative mx-auto flex min-h-[72svh] md:min-h-[82svh] max-w-7xl items-end px-5 pb-12 pt-32 sm:px-8 md:pb-20">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-brand-gold">Horizon Travels</p>
                        <h1 className="font-serif text-5xl leading-[0.9] tracking-tight text-white sm:text-7xl md:text-8xl">Extraordinary stays.<br />Thoughtfully planned.</h1>
                        <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">Discover curated destinations, plan personal journeys, and explore live travel information with clarity.</p>
                    </div>
                </div>
            </section>
            <div className="relative z-10 bg-[#0c0c0c]">
                <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 md:py-9">
                    <Link to="/travel" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-black transition-transform hover:bg-brand-gold active:scale-[0.98] sm:w-auto sm:min-w-64">
                        Explore destinations
                    </Link>
                </div>
                <PricingSection />
                <BentoGrid />
            </div>
        </main>
    );
}
