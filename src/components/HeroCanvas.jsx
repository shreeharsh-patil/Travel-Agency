import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useCanvasVideo } from '../hooks/useCanvasVideo';

// GSAP is pulled into its own lazy chunk by vite.config.js (manualChunks),
// which is only fetched when the home page loads.
gsap.registerPlugin(ScrollTrigger);

export default function HeroCanvas({ scrollTrackRef }) {
    const canvasRef = useRef(null);
    const textRef1 = useRef(null);
    const textRef2 = useRef(null);
    const textRef3 = useRef(null);
    const [compactHero, setCompactHero] = useState(false);

    // Use the hook to get the image drawing function (frames lazy-load on scroll).
    const { drawFrame, isLoading, progress } = useCanvasVideo(canvasRef);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
        const update = () => setCompactHero(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        // Initial draw
        drawFrame(0);

        if (compactHero) return undefined;

        // Resize handler using the current progress
        const handleResize = () => {
            const st = ScrollTrigger.getById('hero-scroll');
            if (st) {
                drawFrame(st.progress * 277);
            }
        };
        window.addEventListener('resize', handleResize);

        // GSAP ScrollTrigger — track the parent container's progress.
        const tl = gsap.timeline({
            scrollTrigger: {
                id: 'hero-scroll',
                trigger: scrollTrackRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0,
                onUpdate: (self) => {
                    const frameIndex = Math.floor(self.progress * 277);
                    drawFrame(frameIndex);
                },
            },
        });

        // TEXT ANIMATIONS (0 to 1 progress of the container)

        // Scene 1: EXPLORE PARADISE (0% - 25%)
        tl.fromTo(
            textRef1.current,
            { opacity: 0, scale: 0.9, y: 50 },
            { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 0.1 },
            0
        );
        tl.to(textRef1.current, { opacity: 0, scale: 1.1, y: -50, ease: 'power2.in', duration: 0.05 }, 0.2);

        // Scene 2: FINANCING PLANS (30% - 60%)
        tl.fromTo(
            textRef2.current,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 },
            0.3
        );
        tl.to(textRef2.current, { opacity: 0, x: -50, ease: 'power2.in', duration: 0.05 }, 0.55);

        // Scene 3: YOU DESERVE IT (65% - 100%)
        tl.fromTo(
            textRef3.current,
            { opacity: 0, scale: 0.9, y: 50 },
            { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 0.1 },
            0.65
        );

        return () => {
            window.removeEventListener('resize', handleResize);
            ScrollTrigger.getById('hero-scroll')?.kill();
            tl.kill();
        };
    }, [isLoading, compactHero, drawFrame, scrollTrackRef]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
                <h1 className="font-serif text-2xl tracking-widest mb-4">LOADING EXPERIENCE</h1>
                <div className="w-64 h-0.5 bg-white/20 overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black">
            <canvas
                ref={canvasRef}
                className="block w-full h-full object-cover filter contrast-[1.05] saturate-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75 pointer-events-none" />

            {/* Text Layer */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {/* Text 1: Centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 ref={textRef1} className={`font-serif text-[clamp(3.25rem,15vw,8rem)] text-white text-center leading-[0.9] tracking-tighter drop-shadow-2xl ${compactHero ? 'opacity-100 px-5' : 'opacity-0'}`}>
                        EXPLORE<br />PARADISE
                    </h1>
                </div>

                {/* Text 2: Bottom Left */}
                <div className={`absolute inset-0 items-end justify-start pb-32 pl-10 md:pl-20 ${compactHero ? 'hidden' : 'flex'}`}>
                    <div>
                        <h1 ref={textRef2} className="font-serif text-[clamp(3rem,6vw,5rem)] text-white leading-none opacity-0 drop-shadow-2xl text-left">
                            We have<br />financing<br />plans.
                        </h1>
                    </div>
                </div>

                {/* Text 3: Center */}
                <div className={`absolute inset-0 items-center justify-center ${compactHero ? 'hidden' : 'flex'}`}>
                    <h1 ref={textRef3} className="font-serif text-[clamp(3rem,8vw,7rem)] text-white text-center leading-none opacity-0 drop-shadow-2xl">
                        YOU DESERVE IT
                    </h1>
                </div>
            </div>
            {compactHero && (
                <div className="absolute inset-x-5 bottom-9 z-20 flex flex-col gap-3">
                    <p className="text-center text-xs tracking-[0.22em] uppercase text-white/75">Extraordinary stays, thoughtfully planned</p>
                    <Link to="/travel" className="pointer-events-auto min-h-12 rounded-full bg-white px-5 py-3.5 text-center text-xs font-bold uppercase tracking-[0.18em] text-black shadow-xl active:scale-[0.98]">Explore destinations</Link>
                </div>
            )}
        </div>
    );
}
