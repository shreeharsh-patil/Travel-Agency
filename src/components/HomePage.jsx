import React, { useRef } from 'react';

import HeroCanvas from './HeroCanvas';
import PricingSection from './PricingSection';
import BentoGrid from './BentoGrid';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const containerRef = useRef(null);

    return (
        <main className="w-full bg-[#0c0c0c]">
            {/* 
        SCROLL TRACK: 300vh height total.
        Inside we have a STICKY container for the hero.
      */}
            <div ref={containerRef} className="relative h-[190svh] md:h-[300vh]">
                <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
                    {/* Pass the container ref so HeroCanvas can use it as a trigger if needed, 
              or simply rely on its internal logic knowing it's sticky */}
                    <HeroCanvas scrollTrackRef={containerRef} />
                </div>
            </div>

            {/* 
        NEXT SECTION: Appears immediately after the 300vh track.
        No negative margins needed. It just flows naturally.
      */}
            <div className="relative z-10 bg-[#0c0c0c]">
                <div className="md:hidden px-5 pt-8 pb-4 text-center">
                    <p className="text-xs tracking-[0.22em] uppercase text-white/65">Extraordinary stays, thoughtfully planned</p>
                    <Link to="/travel" className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-black active:scale-[0.98]">
                        Explore destinations
                    </Link>
                </div>
                <PricingSection />
                <BentoGrid />
            </div>
        </main>
    );
}
