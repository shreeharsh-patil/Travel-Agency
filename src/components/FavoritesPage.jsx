import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { destinations } from '../data/destinations';
import SafeImage from './SafeImage';
import { useToast } from '../contexts/ToastContext';

export default function FavoritesPage() {
  const toast = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites');
      setIsLoggedIn(res.status !== 401);
      if (res.ok) {
        const data = await res.json();
        
        // Match with static & DB places
        const favItems = (data.favorites || []).map(f => {
          const matched = destinations.find(d => d.slug === f.place_id || d.id === f.place_id);
          return {
            id: f.place_id,
            slug: f.place_id,
            name: matched ? (matched.name || matched.title) : (f.place_name || 'Sanctuary'),
            image: matched ? matched.image : (f.place_image || '/images/tropical_beach.png'),
            price: matched ? matched.price : (f.place_price || '₹35,000'),
            location: matched ? matched.location : 'Global Sanctuary'
          };
        });

        setFavorites(favItems);
      }
    } catch (err) {
      console.error('Fetch favorites error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (placeId) => {
    try {
      await fetch(`/api/favorites?place_id=${placeId}`, {
        method: 'DELETE'
      });
      setFavorites(prev => prev.filter(item => item.id !== placeId));
      window.dispatchEvent(new Event('favorites-updated'));
      toast.info('Removed sanctuary from your wishlist');
    } catch (err) {
      console.error('Remove favorite error:', err);
      toast.error('Could not remove sanctuary.');
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em]">Personal Collection</span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white">Your Saved <span className="text-brand-gold italic">Sanctuaries</span></h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Persistent favorites saved to your account.
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="py-16 text-center bg-[#121214] border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-4xl block">🔒</span>
            <h3 className="font-serif text-2xl text-white">Please Sign In</h3>
            <p className="text-white/60 text-xs max-w-sm mx-auto">
              Sign in to view and synchronize your saved favorite places across devices.
            </p>
            <Link to="/login" className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
              Sign In to Account
            </Link>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-white/50 space-y-3">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest">Loading Saved Places...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-16 text-center bg-[#121214] border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-4xl block">♡</span>
            <h3 className="font-serif text-2xl text-white">No Saved Places Yet</h3>
            <p className="text-white/60 text-xs max-w-sm mx-auto">
              Explore our global sanctuaries and click "♡ Save" to save your favorite destinations.
            </p>
            <Link to="/travel" className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
              Browse Destinations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group"
              >
                <div className="h-52 relative overflow-hidden">
                  <SafeImage src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-red-400 flex items-center justify-center hover:bg-black"
                    title="Remove from favorites"
                  >
                    ♥
                  </button>
                  <span className="absolute bottom-3 left-4 text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    {item.location}
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-2xl text-white group-hover:text-brand-gold transition-colors">{item.name}</h4>
                    <span className="font-mono text-lg font-bold text-brand-gold block mt-1">{item.price}</span>
                  </div>

                  <Link
                    to={`/places/${item.slug}`}
                    className="w-full py-2.5 rounded-full bg-white/10 text-white text-center text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-colors block"
                  >
                    View Sanctuary →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
