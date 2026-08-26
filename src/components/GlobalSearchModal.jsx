import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CurrencyPrice from './CurrencyPrice';
import { useCurrency } from '../contexts/CurrencyContext';
import SafeImage from './SafeImage';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { currency, currencies } = useCurrency();
  const currencyMeta = currencies.find((c) => c.code === currency) || currencies[0];
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ places: [], packages: [], experiences: [], guides: [] });

  const [externalPlaces, setExternalPlaces] = useState([]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults({ places: [], packages: [], experiences: [], guides: [] });
      setExternalPlaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const [res, extRes] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal }),
          fetch(`/api/external-places?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        ]);

        if (res.ok) {
          const data = await res.json();
          setResults(data.results || { places: [], packages: [], experiences: [], guides: [] });
        }

        if (extRes.ok) {
          const extData = await extRes.json();
          setExternalPlaces(extData.places || []);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Search API error:', err);
        setError('Could not complete search. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query]);


  if (!isOpen) return null;

  const totalResultsCount =
    results.places.length +
    externalPlaces.length +
    results.packages.length +
    results.experiences.length +
    results.guides.length;


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          className="relative w-full max-w-3xl bg-[#121214] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-6"
        >
          {/* Header Search Bar */}
          <div className="p-6 bg-black/60 border-b border-white/10 flex items-center gap-4">
            <span className="text-xl text-brand-gold">🔍</span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, countries (Goa, Japan), packages, experiences..."
              className="w-full bg-transparent text-white placeholder-white/40 text-base sm:text-lg focus:outline-none font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-white/50 hover:text-white uppercase font-mono tracking-wider"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto font-sans">
            {loading && (
              <div className="py-12 text-center text-white/60 space-y-3">
                <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs uppercase font-mono tracking-widest">Searching database & destinations...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {!loading && !query.trim() && (
              <div className="py-10 text-center">
                <span className="text-3xl block mb-2">🏖️</span>
                <h4 className="font-serif text-lg text-white mb-1">Global Place & Destination Search</h4>
                <p className="text-white/50 text-xs max-w-md mx-auto mb-6">
                  Try searching for <span className="text-brand-gold">"Goa"</span>, <span className="text-brand-gold">"Kyoto"</span>, <span className="text-brand-gold">"Beach"</span>, or <span className="text-brand-gold">"Villa"</span>.
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {['Goa', 'Kyoto', 'Amalfi Coast', 'Aspen', 'Bali', 'Reykjavik'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && query.trim() && totalResultsCount === 0 && !error && (
              <div className="py-12 text-center bg-white/5 rounded-2xl border border-white/10">
                <span className="text-4xl block mb-3">📍</span>
                <h4 className="font-serif text-xl text-white mb-2">No Places Found for "{query}"</h4>
                <p className="text-white/60 text-xs max-w-md mx-auto mb-6">
                  We couldn't find a matching destination in our database. You can suggest a new place to be added to Horizon Travels!
                </p>
                <Link
                  to="/suggest-place"
                  onClick={onClose}
                  className="inline-block px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg"
                >
                  + Suggest This Place
                </Link>
              </div>
            )}

            {!loading && query.trim() && totalResultsCount > 0 && (
              <div className="space-y-6">
                {/* Categorized Places / Destinations */}
                {results.places.length > 0 && (
                  <div>
                    <h5 className="font-mono text-xs text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>Verified & Community Places</span>
                      <span className="text-white/40">({results.places.length})</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.places.map((place) => (
                        <Link
                          key={place.slug || place.id}
                          to={`/places/${place.slug || place.id}`}
                          onClick={onClose}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/40 hover:bg-white/10 transition-all flex items-center gap-3.5 group"
                        >
                          <SafeImage
                            src={place.image}
                            alt={place.name}
                            loading="lazy"
                            decoding="async"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider block">
                              {place.country} • {place.category}
                            </span>
                            <h6 className="font-serif text-base text-white truncate group-hover:text-brand-gold transition-colors">
                              {place.name}
                            </h6>
                            <p className="text-white/60 text-xs font-mono font-bold">
                              <CurrencyPrice amount={place.price} />
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Global Destinations */}
                {externalPlaces.length > 0 && (
                  <div>
                    <h5 className="font-mono text-xs text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>Global Destinations</span>
                      <span className="text-white/40">({externalPlaces.length})</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {externalPlaces.map((ext) => (
                        <Link
                          key={ext.place_id}
                          to={`/travel?search=${encodeURIComponent(ext.name)}`}
                          onClick={onClose}
                          className="block p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1 transition-colors hover:border-brand-gold/40 hover:bg-white/10"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-serif text-white font-semibold truncate">{ext.name}</span>
                            <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full font-bold">
                              Verified
                            </span>
                          </div>
                          <p className="text-white/50 text-[10px] truncate">{ext.displayName}</p>
                          {ext.coordinates && (
                            <div className="text-[10px] font-mono text-brand-gold">
                              GPS: {Number(ext.coordinates.lat).toFixed(2)}°, {Number(ext.coordinates.lon).toFixed(2)}°
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}



                {/* Available Travel Packages */}
                {results.packages.length > 0 && (
                  <div>
                    <h5 className="font-mono text-xs text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>Travel Packages</span>
                      <span className="text-white/40">({results.packages.length})</span>
                    </h5>
                    <div className="space-y-2">
                      {results.packages.map((pkg) => (
                        <Link
                          key={pkg.id}
                          to={`/places/${pkg.placeSlug || pkg.slug || ''}`}
                          onClick={onClose}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 flex justify-between items-center text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-brand-gold">🧳</span>
                            <span className="text-white font-medium">{pkg.title}</span>
                          </div>
                          <span className="font-mono text-brand-gold font-bold"><CurrencyPrice amount={pkg.price} /></span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experiences */}
                {results.experiences.length > 0 && (
                  <div>
                    <h5 className="font-mono text-xs text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span>Curated Experiences</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.experiences.map((exp) => (
                        <div key={exp.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{exp.title}</div>
                            <div className="text-white/50 text-[10px]">{exp.location}</div>
                          </div>
                          <span className="font-mono text-brand-gold"><CurrencyPrice amount={exp.price} /></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-black/40 border-t border-white/10 text-center text-xs text-white/50 font-mono">
            Showing real-time results in {currencyMeta.code} ({currencyMeta.symbol})
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
