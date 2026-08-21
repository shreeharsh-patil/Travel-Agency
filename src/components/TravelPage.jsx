import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { parseINR } from '../utils/currency';
import ReservationForm from './ReservationForm';
import CurrencyPrice from './CurrencyPrice';
import { DestinationGridSkeleton } from './Skeletons';
import SafeImage from './SafeImage';

export default function TravelPage() {
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [allPlaces, setAllPlaces] = useState(destinations);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPublicPlaces();
    }, []);

    const fetchPublicPlaces = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/places?status=APPROVED');
            if (res.ok) {
                const data = await res.json();
                if (data.places && data.places.length > 0) {
                    setAllPlaces(data.places);
                }
            }
        } catch (err) {
            console.error('Fetch public places error:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Beach', 'Mountain', 'Cultural', 'Luxury', 'Adventure'];

    const filteredPlaces = useMemo(() => {
        return allPlaces.filter((place) => {
            const matchesSearch =
                String(place.name || place.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(place.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(place.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === 'All' ||
                String(place.category || '').toLowerCase() === selectedCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });
    }, [allPlaces, searchQuery, selectedCategory]);

    return (
        <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 md:px-10">
            <div className="max-w-7xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <span className="font-mono text-xs text-brand-gold uppercase tracking-[0.3em] block mb-2">
                        Curated Hideaways & Community Places
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">
                        Plan Your <span className="text-brand-gold italic">Journey</span>
                    </h1>
                    <p className="text-white/60 font-sans text-lg max-w-2xl mx-auto">
                        Explore verified sanctuaries and approved community-submitted places across India and around the globe.
                    </p>
                </motion.div>

                {/* Filter & Search Bar */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-1/2">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search destinations, countries (Goa, Japan)..."
                                className="w-full bg-black/40 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-gold"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50">
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-sans transition-all whitespace-nowrap ${
                                        selectedCategory === cat
                                            ? 'bg-brand-gold text-black font-bold shadow-lg shadow-brand-gold/20'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Places Grid */}
                {loading ? (
                    <DestinationGridSkeleton count={6} />
                ) : filteredPlaces.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                        <span className="text-4xl block">🏝️</span>
                        <h3 className="font-serif text-2xl text-white">No Destinations Found</h3>
                        <p className="text-white/60 text-xs max-w-sm mx-auto">
                            No places match your filter criteria. Try suggesting a place or resetting your search.
                        </p>
                        <Link to="/suggest-place" className="inline-block px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest">
                            + Suggest a Place
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPlaces.map((dest, idx) => (
                            <motion.div
                                key={dest._id || dest.slug || dest.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className="group relative h-[480px] rounded-[36px] overflow-hidden border border-white/10 hover:border-brand-gold/40 transition-all duration-500 bg-[#121214] flex flex-col justify-end shadow-2xl"
                            >
                                <SafeImage
                                    src={dest.image || '/images/tropical_beach.png'}
                                    alt={dest.name || dest.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

                                <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-3 py-1 text-[11px] font-mono text-brand-gold border border-brand-gold/30 rounded-full bg-black/50 backdrop-blur-md uppercase tracking-wider">
                                            {dest.country || dest.location}
                                        </span>
                                        <span className="text-xs font-mono text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full">
                                            ★ {dest.rating || 4.8}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-3xl text-white mb-1 group-hover:text-brand-gold transition-colors">
                                        {dest.name || dest.title}
                                    </h3>
                                    <p className="text-white/70 text-xs italic mb-4 line-clamp-2">
                                        {dest.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div>
                                            <span className="text-[10px] uppercase font-mono text-white/40 block">From</span>
                                            <span className="text-brand-gold font-mono text-lg font-bold">
                                                <CurrencyPrice amount={parseINR(dest.price) || dest.priceFrom || 35000} />
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/places/${dest.slug || dest.id}`}
                                                className="px-4 py-2 rounded-full border border-white/20 text-white text-xs font-sans font-semibold hover:bg-white hover:text-black transition-colors"
                                            >
                                                Details
                                            </Link>
                                            <button
                                                onClick={() => setSelectedDestination(dest)}
                                                className="px-4 py-2 rounded-full bg-brand-gold text-black text-xs font-sans font-bold uppercase tracking-wider hover:bg-white transition-colors"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Wizard Modal */}
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
