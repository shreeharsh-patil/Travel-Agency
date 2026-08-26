import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CurrencyPrice from './CurrencyPrice';
import { useCurrency } from '../contexts/CurrencyContext';
import SafeImage from './SafeImage';

const RECENT_SEARCHES_KEY = 'horizon_recent_searches';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currency, currencies } = useCurrency();
  const currencyMeta = currencies.find((c) => c.code === currency) || currencies[0];
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'places' | 'packages' | 'experiences'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ places: [], packages: [], experiences: [], guides: [] });
  const [externalPlaces, setExternalPlaces] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const saveRecentSearch = (searchTerm) => {
    const term = searchTerm.trim();
    if (!term) return;
    try {
      setRecentSearches((prev) => {
        const updated = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (e, termToRemove) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((t) => t !== termToRemove);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(-1);
      return;
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults({ places: [], packages: [], experiences: [], guides: [] });
      setExternalPlaces([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedIndex(-1);

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

        saveRecentSearch(query);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Search API error:', err);
        setError('Could not complete search. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query]);

  // Flatten searchable list for keyboard navigation
  const flatItems = useMemo(() => {
    const list = [];

    if (activeTab === 'all' || activeTab === 'places') {
      results.places.forEach((p) => {
        list.push({
          type: 'place',
          id: p.slug || p.id,
          title: p.name,
          subtitle: `${p.country || ''} • ${p.category || 'Sanctuary'}`,
          price: p.price,
          image: p.image,
          url: `/places/${p.slug || p.id}`
        });
      });

      externalPlaces.forEach((ext) => {
        list.push({
          type: 'external',
          id: ext.place_id,
          title: ext.name,
          subtitle: ext.displayName,
          badge: 'Verified Destination',
          url: `/travel?search=${encodeURIComponent(ext.name)}`
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'packages') {
      results.packages.forEach((pkg) => {
        list.push({
          type: 'package',
          id: pkg.id,
          title: pkg.title,
          subtitle: 'Curated Itinerary Package',
          price: pkg.price,
          url: `/places/${pkg.placeSlug || pkg.slug || ''}`
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'experiences') {
      results.experiences.forEach((exp) => {
        list.push({
          type: 'experience',
          id: exp.id,
          title: exp.title,
          subtitle: exp.location || 'Curated VIP Experience',
          price: exp.price,
          url: `/experiences`
        });
      });
    }

    return list;
  }, [results, externalPlaces, activeTab]);

  // Keyboard navigation listener (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && flatItems[selectedIndex]) {
        e.preventDefault();
        const target = flatItems[selectedIndex];
        onClose();
        navigate(target.url);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, onClose, navigate]);

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
        className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-xl flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-[#111115] border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] my-4"
        >
          {/* Header Search Bar */}
          <div className="p-4 sm:p-5 bg-black/60 border-b border-white/10 flex items-center gap-3">
            <span className="text-xl text-brand-gold">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sanctuaries, countries, luxury stays, experiences..."
              className="w-full bg-transparent text-white placeholder-white/40 text-base sm:text-lg focus:outline-none font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-white/50 hover:text-white uppercase font-mono tracking-wider px-2 py-1 rounded bg-white/5"
              >
                Clear
              </button>
            )}
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 rounded bg-white/10 text-white/50 border border-white/10">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Close search"
            >
              ✕
            </button>
          </div>

          {/* Filter Tabs when query has results */}
          {query.trim() && totalResultsCount > 0 && (
            <div className="px-5 py-2.5 bg-black/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs font-mono">
              {[
                { id: 'all', label: 'All Results', count: totalResultsCount },
                { id: 'places', label: 'Sanctuaries', count: results.places.length + externalPlaces.length },
                { id: 'packages', label: 'Packages', count: results.packages.length },
                { id: 'experiences', label: 'Experiences', count: results.experiences.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-brand-gold text-black font-bold'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75">({tab.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Body Content */}
          <div ref={resultsContainerRef} className="p-5 sm:p-6 max-h-[62vh] overflow-y-auto font-sans">
            {loading && (
              <div className="py-12 text-center text-white/60 space-y-3">
                <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs uppercase font-mono tracking-widest text-brand-gold">
                  Searching global sanctuaries & packages...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Default State: Popular & Recent Searches */}
            {!loading && !query.trim() && (
              <div className="py-6 space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-brand-gold uppercase tracking-widest mb-3">
                      Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          onClick={() => setQuery(term)}
                          className="cursor-pointer group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-brand-gold/15 border border-white/10 text-xs text-white/80 hover:text-brand-gold transition-colors"
                        >
                          <span>🕒 {term}</span>
                          <button
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="text-white/30 group-hover:text-white/70 hover:text-rose-400 text-xs"
                            title="Remove recent search"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">
                    Trending Destinations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Goa Retreats', 'Taj Mahal Agra', 'Swiss Alps Chalet', 'Kyoto Zen', 'Amalfi Coast', 'Bali Luxury Villas', 'Aspen Lodge'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-brand-gold/15 hover:border-brand-gold/40 hover:text-brand-gold transition-all"
                      >
                        ✨ {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
                  <span>Tip: Use ↑ ↓ arrows to navigate results</span>
                  <span>Press ESC to exit</span>
                </div>
              </div>
            )}

            {/* No Results Found */}
            {!loading && query.trim() && totalResultsCount === 0 && !error && (
              <div className="py-12 text-center bg-white/5 rounded-3xl border border-white/10 p-6 space-y-4">
                <span className="text-4xl block">🏖️</span>
                <h4 className="font-serif text-xl text-white">No Sanctuaries Found for "{query}"</h4>
                <p className="text-white/60 text-xs max-w-md mx-auto">
                  We couldn't find a direct match. You can submit this location as a new sanctuary to Horizon Travels!
                </p>
                <Link
                  to="/suggest-place"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  <span>✨ Suggest This Sanctuary</span>
                </Link>
              </div>
            )}

            {/* Render Flat Filtered Items with Keyboard Selection */}
            {!loading && query.trim() && totalResultsCount > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {flatItems.map((item, idx) => {
                    const isSelected = selectedIndex === idx;

                    return (
                      <Link
                        key={`${item.type}-${item.id}`}
                        to={item.url}
                        onClick={onClose}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 group relative ${
                          isSelected
                            ? 'bg-brand-gold/20 border-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                            : 'bg-white/5 border-white/10 hover:border-brand-gold/40 hover:bg-white/10'
                        }`}
                      >
                        {item.image ? (
                          <SafeImage
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0 text-brand-gold">
                            {item.type === 'package' ? '🧳' : item.type === 'experience' ? '🧭' : '📍'}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-mono text-brand-gold uppercase tracking-wider truncate">
                              {item.subtitle}
                            </span>
                            {item.badge && (
                              <span className="text-[8.5px] font-mono bg-brand-gold/15 text-brand-gold px-1.5 py-0.2 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <h6 className="font-serif text-sm text-white truncate group-hover:text-brand-gold transition-colors font-medium">
                            {item.title}
                          </h6>

                          {item.price && (
                            <p className="text-brand-gold/90 text-xs font-mono font-bold mt-0.5">
                              <CurrencyPrice amount={item.price} />
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-mono text-brand-gold pr-1">↵</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3.5 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
            <span>Showing rates in {currencyMeta.code} ({currencyMeta.symbol})</span>
            <span className="hidden sm:inline">Press ↵ Enter to visit</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
