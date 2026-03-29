import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { destinations } from '../data/destinations';
import ReservationForm from './ReservationForm';

export default function TravelPage() {
    const [selectedDestination, setSelectedDestination] = useState(null);

    return (
        <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-20 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 text-center"
                >
                    <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">Plan Your <span className="text-brand-gold">Journey</span></h1>
                    <p className="text-white/60 font-sans text-lg max-w-2xl mx-auto">
                        Explore our curated selection of global sanctuaries. <br />
                        <span className="text-brand-gold font-bold text-sm uppercase tracking-widest mt-2 inline-block">Double Click to Reserve</span>
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((dest, idx) => (
                        <motion.div
                            key={dest.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="group relative h-[500px] rounded-[40px] overflow-hidden cursor-pointer border border-white/5 hover:border-brand-gold/30 transition-colors"
                            onDoubleClick={() => setSelectedDestination(dest)}
                        >
                            <img
                                src={dest.image}
                                alt={dest.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <span className="inline-block px-3 py-1 mb-4 text-xs font-mono text-brand-gold border border-brand-gold/30 rounded-full w-fit bg-black/20 backdrop-blur-md">
                                    {dest.location}
                                </span>
                                <h3 className="font-serif text-3xl text-white mb-2">{dest.title}</h3>
                                <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{dest.description}</p>
                                    <p className="text-brand-gold font-mono text-lg">{dest.price} <span className="text-xs text-white/40 align-middle">/ Package</span></p>
                                </div>
                            </div>

                            {/* Hover Overlay Hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                                    <span className="text-white text-xs uppercase tracking-widest font-bold">Double Click to Reserve</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedDestination && (
                    <ReservationForm
                        destination={selectedDestination}
                        onClose={() => setSelectedDestination(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
