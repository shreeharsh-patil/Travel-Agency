import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryData } from '../data/galleryData';

export default function GalleryPage() {
    const [selectedId, setSelectedId] = useState(null);

    return (
        <section className="min-h-screen bg-[#0c0c0c] text-white pt-32 pb-20 px-4 md:px-12">
            <div className="max-w-[1920px] mx-auto">
                <div className="mb-20 text-center">
                    <h1 className="font-serif text-[12vw] md:text-[8vw] leading-none opacity-90">
                        Moments.
                    </h1>
                    <p className="font-sans text-sm md:text-base opacity-60 mt-4 tracking-widest uppercase">
                        Capturing the art of travel
                    </p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {galleryData.map((item) => (
                        <motion.div
                            layoutId={`container-${item.id}`}
                            key={item.id}
                            className="relative group cursor-pointer break-inside-avoid rounded-2xl overflow-hidden"
                            onDoubleClick={() => setSelectedId(item.id)}
                        >
                            <motion.img
                                layoutId={`image-${item.id}`}
                                src={item.src}
                                alt={item.alt}
                                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                <p className="text-xs font-sans tracking-[0.2em] text-white uppercase">Double Click to Expand</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
                            onClick={() => setSelectedId(null)}
                        >
                            {galleryData.map((item) => {
                                if (item.id === selectedId) {
                                    return (
                                        <motion.div
                                            layoutId={`container-${item.id}`}
                                            key={item.id}
                                            className="relative max-w-7xl w-full max-h-full flex flex-col items-center justify-center"
                                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                                        >
                                            <motion.img
                                                layoutId={`image-${item.id}`}
                                                src={item.src}
                                                alt={item.alt}
                                                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="mt-6 text-center"
                                            >
                                                <h3 className="font-serif text-2xl md:text-4xl text-white mb-2">{item.caption}</h3>
                                                <p className="font-sans text-white/50 text-sm uppercase tracking-widest">{item.category}</p>
                                            </motion.div>

                                            <button
                                                onClick={() => setSelectedId(null)}
                                                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
                                            >
                                                CLOSE [X]
                                            </button>
                                        </motion.div>
                                    );
                                }
                                return null;
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
