
import React from 'react';
import { motion } from "framer-motion";
import { bentoCards } from "../data/travelData";

const Card = ({ card, index }) => {
    const isLarge = card.size === "large";
    const isWide = card.size === "wide";
    const isPenthouse = card.id === "penthouse";

    // Grid span logic
    let spanClasses = "col-span-1 md:row-span-1 aspect-square";
    if (isLarge) {
        spanClasses = "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto";
    } else if (isWide) {
        spanClasses = "md:col-span-2 md:row-span-1 aspect-[2/1]";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
            className={`group relative overflow-hidden rounded-3xl bg-neutral-900 ${spanClasses} ${isPenthouse ? 'border border-travel-gold/20 shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)]' : ''}`}
        >
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 ${isPenthouse ? 'opacity-80' : ''}`}
                >
                    <source src={card.videoPath} type="video/mp4" />
                </video>
                {/* Gradient Overlay Base */}
                <div className={`absolute inset-0 bg-gradient-to-t ${isPenthouse ? 'from-black/80 via-black/40 to-transparent' : 'from-black/60 via-black/20 to-transparent'} opacity-60 transition-opacity duration-700 ease-in-out group-hover:opacity-40`} />
            </div>

            {/* Glass Overlay (Reveals on Hover) */}
            <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 bg-white/5 backdrop-blur-[2px] border-[1px] border-white/10 m-4 rounded-2xl" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8 transition-transform duration-700 ease-[0.25,0.1,0.25,1.0] group-hover:-translate-y-2">
                {/* Top: Stats or Penthouse Chip */}
                <div className="flex justify-between items-start">
                    <span className={`inline-block rounded-full backdrop-blur-md px-3 py-1 font-mono text-xs border transition-colors duration-500 ${isPenthouse ? 'bg-travel-gold/20 text-travel-gold border-travel-gold/30' : 'bg-black/30 text-travel-white/80 border-white/10'}`}>
                        {card.stats}
                    </span>
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 bg-white text-black rounded-full p-2 ${isPenthouse ? 'bg-travel-gold text-black' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </div>
                </div>

                {/* Penthouse Center Visual (Optional) */}
                {isPenthouse && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-700 ease-in-out">
                        <div className="w-12 h-1 bg-travel-gold/50 rounded-full mb-2 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        <div className="w-12 h-1 bg-travel-gold/30 rounded-full" />
                    </div>
                )}

                {/* Bottom: Info */}
                <div className="translate-y-4 transition-transform duration-700 ease-[0.25,0.1,0.25,1.0] group-hover:translate-y-0">
                    <p className={`font-mono text-xs ${isPenthouse ? 'text-travel-gold' : 'text-travel-gold'} mb-2 uppercase tracking-wide`}>
                        {card.subtitle}
                    </p>
                    <h3 className="font-serif text-3xl md:text-4xl text-white mb-2 leading-none">
                        {card.title}
                    </h3>
                    <div className="h-0 opacity-0 overflow-hidden group-hover:h-auto group-hover:opacity-100 transition-all duration-700 ease-in-out">
                        <p className="text-sm text-gray-200 mt-2 font-sans line-clamp-2">
                            {card.description}
                        </p>
                        <button className={`mt-4 text-xs font-bold uppercase tracking-widest text-white border-b hover:text-travel-gold hover:border-travel-gold transition-colors duration-300 ${isPenthouse ? 'border-travel-gold pb-1 text-travel-gold' : 'border-travel-gold pb-1'}`}>
                            Explore
                        </button>
                    </div>
                </div>
            </div>

            {/* Corner Accents (Decor) */}
            <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isPenthouse ? 'hidden' : ''}`}>
                <div className="w-20 h-20 border-t border-r border-white/20 rounded-tr-3xl" />
            </div>

            {/* Penthouse Specific Decor */}
            {isPenthouse && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-travel-gold to-transparent opacity-50" />
            )}

        </motion.div>
    );
};

export default function BentoGrid() {
    return (
        <section className="px-4 py-20 pb-60 max-w-[1920px] mx-auto bg-[#0c0c0c]">
            <div className="mb-12 md:mb-20 px-4 md:px-12">
                <h2 className="font-serif text-4xl md:text-6xl text-white mb-4">
                    Curated <span className="text-gradient-gold">Destinations</span>
                </h2>
                <div className="w-24 h-1 bg-travel-gold rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                {bentoCards.map((card, idx) => (
                    <Card key={card.id} card={card} index={idx} />
                ))}
            </div>
        </section>
    );
}
