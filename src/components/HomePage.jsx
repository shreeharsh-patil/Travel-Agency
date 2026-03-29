import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCanvas from './HeroCanvas';
import PricingSection from './PricingSection';
import BentoGrid from './BentoGrid';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
    const containerRef = useRef(null);

    return (
        <main className="w-full bg-[#0c0c0c]">
            {/* 
        SCROLL TRACK: 300vh height total.
        Inside we have a STICKY container for the hero.
      */}
            <div ref={containerRef} className="relative h-[300vh]">
                <div className="sticky top-0 h-screen w-full overflow-hidden">
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
                <PricingSection />
                <BentoGrid />
            </div>
        </main>
    );
}
