import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CurrencyPrice from './CurrencyPrice';
import { useCurrency } from '../contexts/CurrencyContext';
import SafeImage from './SafeImage';
import { destinations } from '../data/destinations';

const RECENT_SEARCHES_KEY = 'horizon_recent_searches';

function searchLocalDestinations(rawQuery) {
  const query = (rawQuery || '').toLowerCase().trim();
  if (!query) return [];
  const tokens = query.split(/\s+/).filter(Boolean);
  const stems = tokens.map((t) => t.replace(/s$|es$|ing$|ed$/i, ''));

  return destinations
    .map((d) => {
      const name = String(d.name || '').toLowerCase();
      const title = String(d.title || '').toLowerCase();
      const tagline = String(d.tagline || '').toLowerCase();
      const country = String(d.country || '').toLowerCase();
      const city = String(d.city || '').toLowerCase();
      const state = String(d.state || '').toLowerCase();
      const category = String(d.category || '').toLowerCase();
      const desc = String(d.description || '').toLowerCase();
      const blob = `${name} ${title} ${tagline} ${country} ${city} ${state} ${category} ${desc}`;

      let score = 0;
      if (name === query) score += 150;
      else if (name.includes(query)) score += 120;
      else if (title.includes(query)) score += 100;
      else if (blob.includes(query)) score += 60;

      let matchedTokens = 0;
      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        const stem = stems[i];
        let found = false;

        if (name.includes(tok)) {
          score += 45;
          found = true;
        } else if (stem.length >= 3 && name.includes(stem)) {
          score += 35;
          found = true;
        }

        if (title.includes(tok) || tagline.includes(tok)) {
          score += 30;
          found = true;
        } else if (stem.length >= 3 && (title.includes(stem) || tagline.includes(stem))) {
          score += 25;
          found = true;
        }

        if (city.includes(tok) || country.includes(tok) || state.includes(tok) || category.includes(tok)) {
          score += 25;
          found = true;
        } else if (stem.length >= 3 && (city.includes(stem) || country.includes(stem) || category.includes(stem))) {
          score += 20;
          found = true;
        }

        if (desc.includes(tok) || (stem.length >= 3 && desc.includes(stem))) {
          score += 15;
          found = true;
        }

        if (found) matchedTokens++;
      }

      if (matchedTokens === tokens.length) score += 60;

      return {
        id: d.id || d.slug,
        slug: d.slug || d.id,
        name: d.name || d.title,
        title: d.title || d.name,
        country: d.country,
        city: d.city || d.location,
        category: d.category || 'Destination',
        price: d.price,
        priceFrom: d.priceFrom,
        image: d.image,
        score
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

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

    // Instant local matching for verified destinations
    const localMatches = searchLocalDestinations(query);
    if (localMatches.length > 0) {
      setResults({
        places: localMatches,
        packages: localMatches.map((p) => ({
          id: `pkg-${p.id}`,
          title: `${p.name} Exclusive Luxury Package`,
          placeSlug: p.slug,
          price: p.price
        })),
        experiences: [],
        guides: []
      });
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

        let combinedPlaces = [];
        let packages = [];
        let experiences = [];
        let guides = [];

        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            combinedPlaces = data.results.places || [];
            packages = data.results.packages || [];
            experiences = data.results.experiences || [];
            guides = data.results.guides || [];
          }
        }

        let extPlacesList = [];
        if (extRes.ok) {
          const extData = await extRes.json();
          extPlacesList = extData.places || [];
          setExternalPlaces(extPlacesList);
        }

        // Merge backend places with local matches
        const placeMap = new Map();
        combinedPlaces.forEach((p) => placeMap.set(p.slug || p.id, p));
        localMatches.forEach((p) => {
          if (!placeMap.has(p.slug || p.id)) placeMap.set(p.slug || p.id, p);
        });

        // If no static places matched, add external places directly to main list
        if (placeMap.size === 0 && extPlacesList.length > 0) {
          extPlacesList.forEach((ep) => {
            placeMap.set(ep.slug || ep.id, ep);
          });
        }

        setResults({
          places: Array.from(placeMap.values()),
          packages,
          experiences,
          guides
        });

        saveRecentSearch(query);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Search API error:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

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
        const isStatic = destinations.some((d) => d.slug === p.slug || d.id === p.id);
        list.push({
          type: 'place',
          id: p.slug || p.id,
          title: p.name,
          subtitle: `${p.country || 'Global'} • ${p.category || 'Sanctuary'}`,
          price: p.price,
          image: p.image,
          badge: isStatic ? 'Curated Sanctuary' : 'Worldwide Destination',
          url: isStatic ? `/places/${p.slug || p.id}` : `/plan-trip?destination=${encodeURIComponent(p.name)}`
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
          url: `/plan-trip?destination=${encodeURIComponent(query)}`
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
  }, [results, activeTab, query]);

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
              placeholder="Search any destination, country, city, island, luxury stay..."
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
                { id: 'places', label: 'Destinations', count: results.places.length },
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
          <div ref={resultsContainerRef} className="p-5 sm:p-6 max-h-[62vh] overflow-y-auto font-sans space-y-5">
            {loading && results.places.length === 0 && (
              <div className="py-12 text-center text-white/60 space-y-3">
                <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs uppercase font-mono tracking-widest text-brand-gold">
                  Searching global sanctuaries & worldwide places...
                </p>
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
                    Trending Worldwide Escapes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Goa Retreats', 'Kyoto Zen', 'Amalfi Coast', 'Aspen Alps', 'Bali Villas', 'Paris Seine', 'Santorini', 'Swiss Alps', 'Ladakh'].map((term) => (
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
                  <span>Tip: You can search any city, country, or island on Earth</span>
                  <span>Press ESC to exit</span>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {query.trim() && totalResultsCount > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {flatItems.map((item, idx) => {
                    const isSelected = selectedIndex === idx;

                    return (
                      <Link
                        key={`${item.type}-${item.id}-${idx}`}
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
                              <span className="text-[8.5px] font-mono bg-brand-gold/15 text-brand-gold px-1.5 py-0.2 rounded flex-shrink-0">
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

                {/* 1-Click Worldwide Planning Actions */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-brand-gold uppercase tracking-wider font-semibold">
                    Instant Global Actions for "{query}"
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <Link
                      to={`/plan-trip?destination=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="p-2.5 rounded-xl bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold flex items-center gap-2 transition-colors font-medium"
                    >
                      <span>✨</span>
                      <span className="truncate">Plan AI Trip to {query}</span>
                    </Link>
                    <Link
                      to={`/flights?to=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 flex items-center gap-2 transition-colors font-medium"
                    >
                      <span>🛫</span>
                      <span className="truncate">Search Flights to {query}</span>
                    </Link>
                    <Link
                      to={`/hotels?city=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 flex items-center gap-2 transition-colors font-medium"
                    >
                      <span>🏨</span>
                      <span className="truncate">Find 5-Star Stays</span>
                    </Link>
                  </div>
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
