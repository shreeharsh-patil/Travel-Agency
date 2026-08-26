import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { parseINR } from '../utils/currency';
import ReservationForm from './ReservationForm';
import CurrencyPrice from './CurrencyPrice';
import { DestinationGridSkeleton } from './Skeletons';
import SafeImage from './SafeImage';
import { useToast } from '../contexts/ToastContext';

const AMENITY_FILTERS = [
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'pool', name: 'Pool', icon: '🏊‍♂️' },
  { id: 'ac', name: 'AC', icon: '❄️' },
  { id: 'parking', name: 'Parking', icon: '🚗' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'pets', name: 'Pets', icon: '🐾' },
  { id: 'view', name: 'View', icon: '🌅' },
  { id: 'spa', name: 'Spa', icon: '🧘' }
];

export default function TravelPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [allPlaces, setAllPlaces] = useState(destinations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublicPlaces();
    fetchUserFavorites();
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

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

  const fetchUserFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favorites)) {
          setFavorites(data.favorites.map(f => f.place_id || f.id || f));
        }
      }
    } catch {
      // User may not be logged in
    }
  };

  const toggleFavorite = async (dest, e) => {
    e.preventDefault();
    e.stopPropagation();
    const destId = dest._id || dest.slug || dest.id;
    const isFav = favorites.includes(destId);

    // Optimistic UI update
    setFavorites(prev => isFav ? prev.filter(id => id !== destId) : [...prev, destId]);

    try {
      if (isFav) {
        await fetch(`/api/favorites?id=${encodeURIComponent(destId)}`, { method: 'DELETE' });
        toast.info(`Removed ${dest.name || 'sanctuary'} from wishlist`);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place_id: destId,
            name: dest.name || dest.title,
            image: dest.image,
            location: dest.location || dest.country,
            price: dest.price || dest.priceFrom
          })
        });
        toast.success(`Saved ${dest.name || 'sanctuary'} to your wishlist! ❤️`);
      }
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const categories = ['All', 'Beach', 'Mountain', 'Cultural', 'Luxury', 'Adventure', 'Historical', 'Wildlife'];

  const toggleAmenity = (id) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setSelectedAmenities([]);
  };

  const filteredPlaces = useMemo(() => {
    let result = allPlaces.filter((place) => {
      const matchesSearch =
        String(place.name || place.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(place.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(place.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        String(place.category || '').toLowerCase() === selectedCategory.toLowerCase();

      const numericPrice = parseINR(place.price) || place.priceFrom || 0;
      const matchesMinPrice = minPrice === '' || numericPrice >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || numericPrice <= Number(maxPrice);

      const placeAmenities = Array.isArray(place.amenities) ? place.amenities : [];
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every(a => placeAmenities.includes(a));

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesAmenities;
    });

    if (sortBy === 'price_asc') {
      result.sort((a, b) => (parseINR(a.price) || a.priceFrom || 0) - (parseINR(b.price) || b.priceFrom || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (parseINR(b.price) || b.priceFrom || 0) - (parseINR(a.price) || a.priceFrom || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => String(a.name || a.title || '').localeCompare(String(b.name || b.title || '')));
    }

    return result;
  }, [allPlaces, searchQuery, selectedCategory, minPrice, maxPrice, selectedAmenities, sortBy]);

  const activeFilterCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (selectedAmenities.length) + (sortBy !== 'default' ? 1 : 0);

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
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
            Explore verified sanctuaries, multi-photo community stays, and approved places across India and around the globe.
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
                placeholder="Search destinations, countries (Goa, Japan, Munnar)..."
                className="w-full bg-black/40 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-gold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white">
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-2 border transition-all ${
                  showFilterDrawer || activeFilterCount > 0
                    ? 'bg-brand-gold text-black border-brand-gold font-bold shadow-lg shadow-brand-gold/20'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>⚙️ Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-black text-brand-gold text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <Link
                to="/suggest-place"
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap"
              >
                + Add Place
              </Link>
            </div>
          </div>

          {/* Categories Horizontal Rail */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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

          {/* Expandable Advanced Filter Drawer */}
          <AnimatePresence>
            {showFilterDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-6 border-t border-white/10 space-y-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-white/60">Price Range (₹ INR)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min (e.g. 20000)"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-gold focus:outline-none font-mono"
                      />
                      <span className="text-white/40 text-xs">to</span>
                      <input
                        type="number"
                        placeholder="Max (e.g. 150000)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-gold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-white/60">Sort Stays By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                    >
                      <option value="default">Featured / Default</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="name">Alphabetical (A-Z)</option>
                    </select>
                  </div>

                  {/* Reset Actions */}
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-white/70 text-xs font-mono uppercase tracking-wider transition-colors"
                    >
                      Reset All
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilterDrawer(false)}
                      className="w-full py-2.5 rounded-xl bg-brand-gold text-black font-bold text-xs font-mono uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      Apply ({filteredPlaces.length})
                    </button>
                  </div>
                </div>

                {/* Amenities Pills Filter */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-white/60">Filter by Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_FILTERS.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity.id);
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                            isSelected
                              ? 'bg-brand-gold/20 border-brand-gold text-brand-gold font-semibold'
                              : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <span>{amenity.icon}</span>
                          <span>{amenity.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Places Grid */}
        {loading ? (
          <DestinationGridSkeleton count={6} />
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 space-y-4">
            <span className="text-4xl block">🏝️</span>
            <h3 className="font-serif text-2xl text-white">No Destinations Found</h3>
            <p className="text-white/60 text-xs max-w-sm mx-auto">
              No places match your filter criteria. Try clearing filters or suggesting a new place.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={clearAllFilters} className="px-6 py-2.5 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Clear Filters
              </button>
              <Link to="/suggest-place" className="px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">
                + Suggest a Place
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((dest, idx) => {
              const destId = dest._id || dest.slug || dest.id;
              const isFav = favorites.includes(destId);
              const photoCount = Array.isArray(dest.gallery) && dest.gallery.length > 1 ? dest.gallery.length : 1;

              return (
                <motion.div
                  key={destId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
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

                  {/* Floating Wishlist Heart Button */}
                  <button
                    onClick={(e) => toggleFavorite(dest, e)}
                    className={`absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                      isFav
                        ? 'bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/30 scale-105'
                        : 'bg-black/40 border-white/20 text-white/70 hover:text-red-400 hover:border-red-400/50 hover:scale-110'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <span className="text-base">{isFav ? '❤️' : '🤍'}</span>
                  </button>

                  {/* Photo count badge */}
                  {photoCount > 1 && (
                    <span className="absolute top-6 left-6 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80 flex items-center gap-1">
                      <span>📸</span> {photoCount} photos
                    </span>
                  )}

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
              );
            })}
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
