import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import ReservationForm from './ReservationForm';

export default function ServicePage({ title, subtitle, heroImage, description, features }) {
    const [showReserve, setShowReserve] = useState(false);
    const { scrollY } = useScroll();
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="min-h-screen w-full bg-[#0c0c0c] text-white">
            {/* Parallax Hero */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <motion.div style={{ y: y2 }} className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt={title}
                        className="w-full h-[120%] object-cover opacity-60"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c0c]/20 to-[#0c0c0c]" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="font-mono text-brand-gold text-sm tracking-[0.3em] uppercase mb-4"
                    >
                        {subtitle}
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="font-serif text-[clamp(3rem,8vw,6rem)] leading-none mb-8"
                    >
                        {title}
                    </motion.h1>
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        onClick={() => setShowReserve(true)}
                        className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-sans tracking-widest uppercase text-xs hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all duration-300"
                    >
                        Inquire Now
                    </motion.button>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
                    <div>
                        <h2 className="font-serif text-4xl text-white mb-6">Unrivaled <span className="text-brand-gold">Excellence.</span></h2>
                        <p className="text-white/60 font-sans leading-relaxed text-lg">
                            {description}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <h3 className="font-serif text-xl mb-2 text-white">{feature.title}</h3>
                                <p className="text-xs text-white/50 font-sans uppercase tracking-wide">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showReserve && (
                    <ReservationForm
                        destination={{ title: title, price: "Service Inquiry", image: heroImage }}
                        onClose={() => setShowReserve(false)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
