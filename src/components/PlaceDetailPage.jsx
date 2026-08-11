import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReservationForm from './ReservationForm';
import PlaceMap from './PlaceMap';
import { formatINR } from '../utils/currency';

export default function PlaceDetailPage() {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [sortReviews, setSortReviews] = useState('recent');

  // Review Form State
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    fetchPlaceAndReviews();
    checkIsSaved();
  }, [fetchPlaceAndReviews, checkIsSaved]);

  const [weatherData, setWeatherData] = useState(null);
  const [freeAttractions, setFreeAttractions] = useState([]);
  const [sunTimesData, setSunTimesData] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [expense, setExpense] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(null);
  const [expenseDays, setExpenseDays] = useState(4);
  const [expenseTravellers, setExpenseTravellers] = useState(2);

  const fetchPlaceAndReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch place
      const res = await fetch(`/api/places?slug=${slug}`);
      if (!res.ok) throw new Error('Place not found');
      const data = await res.json();
      setPlace(data.place);

      const placeId = data.place.slug || data.place.id || slug;
      const placeLat = data.place.lat || 15.2993;
      const placeLon = data.place.lon || 74.124;

      // Fetch reviews
      const revRes = await fetch(`/api/reviews?place_id=${placeId}`);
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
        if (revData.ratingBreakdown) setRatingBreakdown(revData.ratingBreakdown);
      }

      // Fetch comments
      const cmtRes = await fetch(`/api/comments?place_id=${placeId}`);
      if (cmtRes.ok) {
        const cmtData = await cmtRes.json();
        setComments(cmtData.comments || []);
      }

      // Fetch live free weather
      fetch(`/api/weather?city=${data.place.name || slug}`)
        .then(r => r.json())
        .then(w => setWeatherData(w))
        .catch(() => {});

      // Fetch solar photography times
      fetch(`/api/sun-times?lat=${placeLat}&lon=${placeLon}`)
        .then(r => r.json())
        .then(s => setSunTimesData(s))
        .catch(() => {});

      // Fetch free attractions
      fetch(`/api/free-attractions?destination=${data.place.name || slug}`)
        .then(r => r.json())
        .then(fa => setFreeAttractions(fa.attractions || []))
        .catch(() => {});

      // Fetch trip expense estimate (INR) — handled in a dedicated effect
      // so changing days/travellers doesn't reload the whole page.

      // Fetch UV index for sun safety
      fetch(`/api/uv-index?lat=${placeLat}&lon=${placeLon}`)
        .then(r => r.json())
        .then(u => setUvIndex(u))
        .catch(() => {});

      const weatherRes = await fetch(`/api/weather?city=${slug}`);
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        setWeatherData(wData);
      }

      // Fetch free attractions
      const freeRes = await fetch(`/api/free-attractions?destination=${slug}`);
      if (freeRes.ok) {
        const fData = await freeRes.json();
        setFreeAttractions(fData.attractions || []);
      }
    } catch (err) {
      console.error('Fetch place detail error:', err);
      setError('Could not load place details.');
    } finally {
      setLoading(false);
    }
  }, [slug]);


  const checkIsSaved = useCallback(async () => {
    const token = localStorage.getItem('horizon_token');
    if (!token) return;
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.placeIds && data.placeIds.includes(slug));
      }
    } catch (err) {
      console.error('Check saved error:', err);
    }
  }, [slug]);

  // Dedicated effect for expense estimator so slider changes don't reload the page
  useEffect(() => {
    if (!place) return;
    const placeId = place.slug || place.id || slug;
    const timer = setTimeout(() => {
      fetch(`/api/expense?destination=${placeId}&days=${expenseDays}&travellers=${expenseTravellers}`)
        .then(r => r.json())
        .then(e => setExpense(e))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [place, slug, expenseDays, expenseTravellers]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('horizon_token');
    if (!token) {
      alert('Please log in to save places to your favorites.');
      return;
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          place_id: slug,
          place_name: place?.name || place?.title,
          place_image: place?.image,
          place_price: place?.price
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.saved);
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    const token = localStorage.getItem('horizon_token');
    if (!token) {
      setReviewError('Please log in to submit a review.');
      setReviewSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          place_id: place.slug || place.id || slug,
          ...reviewForm
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit review.');
      }

      setReviewSuccess('Your review has been submitted successfully!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchPlaceAndReviews();
      setTimeout(() => setShowReviewModal(false), 1500);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentSubmitting(true);
    setCommentError(null);
    setCommentSuccess(null);

    const token = localStorage.getItem('horizon_token');
    if (!token) {
      setCommentError('Please log in to comment on this destination.');
      setCommentSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          place_id: place.slug || place.id || slug,
          text: commentText
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not post comment.');
      }

      setCommentSuccess('Comment added successfully!');
      setCommentText('');
      setComments((prev) => [data.comment, ...prev]);
      setTimeout(() => {
        setShowCommentModal(false);
        setCommentSuccess(null);
      }, 1200);
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortReviews === 'highest') return b.rating - a.rating;
    if (sortReviews === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0); // default recent
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : (place?.rating || 4.8);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] pt-40 pb-20 text-center text-white/60">
        <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-xs uppercase tracking-widest">Loading Place Details...</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] pt-40 pb-20 text-center text-white">
        <span className="text-4xl block mb-2">🏖️</span>
        <h2 className="font-serif text-3xl mb-2">Place Not Found</h2>
        <p className="text-white/60 text-sm max-w-md mx-auto mb-6">{error || "The place you're looking for could not be found."}</p>
        <Link to="/travel" className="px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest">
          View All Destinations
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-28 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/travel" className="hover:text-white">Destinations</Link>
          <span>/</span>
          <span className="text-brand-gold">{place.name || place.title}</span>
        </div>

        {/* Hero Section */}
        <div className="relative h-[480px] sm:h-[540px] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={place.image || '/images/tropical_beach.png'}
            alt={place.name || place.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Action Overlay Badges */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-black/60 backdrop-blur-md border border-brand-gold/30 text-brand-gold uppercase tracking-wider">
                {place.category || 'Luxury'}
              </span>
              {place.status && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                  place.status === 'APPROVED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {place.status === 'APPROVED' ? 'Verified Public Place' : 'Pending Moderation'}
                </span>
              )}
            </div>

            {/* Save / Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={`px-5 py-2.5 rounded-full backdrop-blur-md border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                isSaved
                  ? 'bg-brand-gold text-black border-brand-gold shadow-lg shadow-brand-gold/20'
                  : 'bg-black/60 text-white border-white/20 hover:bg-white hover:text-black'
              }`}
            >
              <span>{isSaved ? '♥ Saved' : '♡ Save'}</span>
            </button>
          </div>

          {/* Bottom Hero Info */}
          <div className="absolute bottom-8 left-6 right-6 sm:left-12 sm:right-12 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
            <div>
              <span className="text-xs font-mono text-white/70 uppercase tracking-widest block mb-1">
                📍 {place.city ? `${place.city}, ` : ''}{place.state_region ? `${place.state_region}, ` : ''}{place.country}
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl text-white">{place.name || place.title}</h1>
              <p className="text-white/80 text-sm italic mt-1 max-w-xl">{place.tagline || place.description?.slice(0, 100)}...</p>
            </div>

            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center gap-6 min-w-[260px]">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase block">Starting Package</span>
                <span className="font-mono text-2xl text-brand-gold font-bold">{formatINR(place.priceFrom || 35000)}</span>
              </div>
              <button
                onClick={() => setShowReserveModal(true)}
                className="px-6 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                Book Package ✨
              </button>
            </div>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Description & Experiences */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-2xl text-white">About {place.name || place.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{place.description}</p>
              {place.longDescription && (
                <p className="text-white/70 text-sm leading-relaxed">{place.longDescription}</p>
              )}
            </div>

            {/* Gallery */}
            {place.gallery && place.gallery.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl text-white mb-4">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {place.gallery.map((img, i) => (
                    <div key={i} className="h-40 rounded-2xl overflow-hidden border border-white/10 group">
                      <img src={img} alt={`${place.name} gallery ${i}`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Map */}
            <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                    🗺️ Interactive Map
                  </span>
                  <h3 className="font-serif text-2xl text-white mt-0.5">
                    Find {place.name || place.title} on the Map
                  </h3>
                </div>
                {place.google_maps_url && (
                  <a
                    href={place.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white hover:text-black transition-colors text-center"
                  >
                    Open in Google Maps ↗
                  </a>
                )}
              </div>
              <PlaceMap place={place} />
            </div>

            {/* Live Free Weather Widget (Open-Meteo API) */}
            {weatherData && (
              <div className="bg-[#141418] border border-brand-gold/30 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      ⚡ Live Weather Forecast
                    </span>

                    <h4 className="font-serif text-2xl text-white mt-0.5">
                      {weatherData.city} • {weatherData.temperature}
                    </h4>
                  </div>
                  <span className="text-sm font-mono text-white/80 bg-white/10 px-3 py-1 rounded-full">
                    {weatherData.condition}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                  {(weatherData.forecast || []).map((f, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-white/40 block text-[10px] uppercase">{f.date}</span>
                      <span className="text-brand-gold font-bold">{f.maxTemp}</span>
                      <span className="text-white/40 block text-[10px]">{f.minTemp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solar & Golden Hour Photography Widget */}
            {sunTimesData && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">
                    🌅 Solar & Golden Hour Times
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Photography Guide</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-white/40 block text-[10px] uppercase">Sunrise</span>
                    <span className="text-brand-gold font-bold">{sunTimesData.sunrise}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-brand-gold/10 border border-brand-gold/30">
                    <span className="text-brand-gold block text-[10px] uppercase font-bold">Golden Hour</span>
                    <span className="text-white font-bold">{sunTimesData.goldenHour}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-white/40 block text-[10px] uppercase">Sunset</span>
                    <span className="text-brand-gold font-bold">{sunTimesData.sunset}</span>
                  </div>
                </div>
              </div>
            )}


            {/* Free Places to Visit (₹0 Entry) */}
            {freeAttractions.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-mono text-green-400 uppercase tracking-widest block">
                      Free Exploration (₹0 Entry Fee)
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-1">Zero-Cost Local Sanctuaries</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-mono font-bold">
                    Free (₹0)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freeAttractions.map((fa, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-brand-gold uppercase">{fa.category}</span>
                        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
                          {fa.fee}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white">{fa.title}</h4>
                      <p className="text-white/60 text-xs">{fa.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Things to Do */}
            {place.thingsToDo && place.thingsToDo.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="font-serif text-2xl text-white">Top Things to Do</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {place.thingsToDo.map((todo, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-3 items-start">
                      <span className="text-brand-gold text-lg font-mono">0{i + 1}</span>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{todo.title}</h4>
                        <p className="text-white/60 text-xs mt-1">{todo.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* REVIEWS SECTION */}
            <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h3 className="font-serif text-2xl text-white">Guest Reviews</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-bold font-mono text-brand-gold">★ {avgRating}</span>
                    <span className="text-white/50 text-xs font-mono">Based on {reviews.length} reviews</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortReviews}
                    onChange={(e) => setSortReviews(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>

                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-colors"
                  >
                    + Write a Review
                  </button>
                </div>
              </div>

              {/* Rating Breakdown Bars */}
              {ratingBreakdown.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pb-2">
                  {[...ratingBreakdown].sort((a, b) => b.rating - a.rating).map((rb) => (
                    <div key={rb.rating} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/60 w-6 shrink-0">{rb.rating}★</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-gold"
                          style={{ width: `${rb.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-white/40 w-7 text-right shrink-0">{rb.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews List */}
              {sortedReviews.length === 0 ? (
                <div className="text-center py-10 text-white/50 space-y-3">
                  <span className="text-3xl block">✍️</span>
                  <p className="text-xs font-mono uppercase tracking-widest">No reviews submitted yet for this sanctuary.</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="text-xs text-brand-gold hover:underline font-bold uppercase"
                  >
                    Be the first to write a review →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedReviews.map((rev) => (
                    <div key={rev._id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.user_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt={rev.user_name}
                            className="w-9 h-9 rounded-full bg-white/10 object-cover"
                          />
                          <div>
                            <span className="text-sm font-semibold text-white block">{rev.user_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-white/40 font-mono">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Verified Stay'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-brand-gold text-xs font-mono">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-sm text-white mb-1">{rev.title}</h5>
                        <p className="text-white/70 text-xs leading-relaxed">{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMMENTS SECTION */}
            <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h3 className="font-serif text-2xl text-white">Traveler Comments</h3>
                  <p className="text-white/50 text-xs font-mono mt-1">
                    {comments.length} comment{comments.length !== 1 ? 's' : ''} on this destination
                  </p>
                </div>
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-colors"
                >
                  + Add a Comment
                </button>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-8 text-white/50 space-y-3">
                  <span className="text-3xl block">💬</span>
                  <p className="text-xs font-mono uppercase tracking-widest">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((cmt) => (
                    <div key={cmt._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img
                            src={cmt.user_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt={cmt.user_name}
                            className="w-8 h-8 rounded-full bg-white/10 object-cover"
                          />
                          <div>
                            <span className="text-sm font-semibold text-white block">{cmt.user_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-white/40 font-mono">
                              {cmt.created_at ? new Date(cmt.created_at).toLocaleDateString() : 'Verified Traveler'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/80 text-xs leading-relaxed">{cmt.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Travel Info Card */}
          <div className="space-y-6">
            <div className="bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-6">
              <h4 className="font-serif text-xl text-white border-b border-white/10 pb-4">Travel Information</h4>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="text-white/40 font-mono uppercase block mb-1">Currency</span>
                  <span className="text-white font-medium">{place.travelInfo?.currency || 'Indian Rupee (INR)'}</span>
                </div>
                <div>
                  <span className="text-white/40 font-mono uppercase block mb-1">Language</span>
                  <span className="text-white font-medium">{place.travelInfo?.language || 'English / Local'}</span>
                </div>
                <div>
                  <span className="text-white/40 font-mono uppercase block mb-1">Best Time to Visit</span>
                  <span className="text-white font-medium">{place.travelInfo?.weather || 'October to March'}</span>
                </div>
                <div>
                  <span className="text-white/40 font-mono uppercase block mb-1">Transport Links</span>
                  <span className="text-white/80 font-medium leading-relaxed">{place.travelInfo?.transport || 'International and regional airport transfers available.'}</span>
                </div>
              </div>

              <button
                onClick={() => setShowReserveModal(true)}
                className="w-full py-3.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
              >
                Reserve Stay in {place.name || place.title}
              </button>
            </div>

            {/* Expense Estimator Widget */}
            <div className="bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-5">
              <div>
                <span className="text-xs font-mono text-brand-gold uppercase tracking-widest block">💰 Trip Expense Estimator</span>
                <h4 className="font-serif text-xl text-white mt-1">Estimated Budget (INR)</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-white/40 font-mono uppercase block text-[10px] mb-1">Days</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={expenseDays}
                    onChange={(e) => setExpenseDays(Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-white/40 font-mono uppercase block text-[10px] mb-1">Travellers</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={expenseTravellers}
                    onChange={(e) => setExpenseTravellers(Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {expense ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 text-center">
                    <span className="text-[10px] font-mono text-brand-gold uppercase block">Total Estimate</span>
                    <span className="font-mono text-2xl font-bold text-brand-gold block">{expense.totalFormatted}</span>
                    <span className="text-[10px] font-mono text-white/50">≈ {expense.perPersonFormatted} per person</span>
                  </div>
                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between"><span className="text-white/50">Flights (return)</span><span className="text-white font-medium">{formatINR(expense.breakdown.flights.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Stay</span><span className="text-white font-medium">{formatINR(expense.breakdown.stay.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Food</span><span className="text-white font-medium">{formatINR(expense.breakdown.food.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Local Transport</span><span className="text-white font-medium">{formatINR(expense.breakdown.localTransport.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Activities</span><span className="text-white font-medium">{formatINR(expense.breakdown.activities.amount)}</span></div>
                  </div>
                  <p className="text-[10px] text-white/40 italic">{expense.disclaimer}</p>
                </div>
              ) : (
                <div className="text-center py-4 text-white/40 text-xs font-mono">Calculating estimate...</div>
              )}
            </div>

            {/* UV Index Widget */}
            {uvIndex && (
              <div className="bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-mono text-brand-gold uppercase tracking-widest block">☀️ UV Index</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-3xl font-bold text-white">{uvIndex.uvIndexMax}</span>
                    <span className="text-xs text-white/50 font-mono ml-1 block">{uvIndex.level}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                    uvIndex.uvIndexMax <= 2 ? 'bg-green-500/20 text-green-300'
                    : uvIndex.uvIndexMax <= 5 ? 'bg-yellow-500/20 text-yellow-300'
                    : uvIndex.uvIndexMax <= 7 ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-red-500/20 text-red-300'
                  }`}>
                    {uvIndex.uvIndexMax <= 2 ? 'Low' : uvIndex.uvIndexMax <= 5 ? 'Moderate' : uvIndex.uvIndexMax <= 7 ? 'High' : 'Very High'}
                  </span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{uvIndex.advice}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#141417] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">Share Your Experience</span>
                <h3 className="font-serif text-2xl text-white mt-1">Review {place.name || place.title}</h3>
              </div>

              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs text-center">
                  ✓ {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
                  ⚠️ {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-white/60">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-3 text-2xl cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`transition-colors ${star <= reviewForm.rating ? 'text-brand-gold' : 'text-white/20'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono text-white/60">Review Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unforgettable beachfront stay!"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono text-white/60">Comment *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Tell other travelers about your stay, private yacht, amenities..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Post Review ✨'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation Form Modal */}
      <AnimatePresence>
        {showReserveModal && (
          <ReservationForm
            destination={place}
            onClose={() => setShowReserveModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Comment Form Modal */}
      <AnimatePresence>
        {showCommentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#141417] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <button
                onClick={() => setShowCommentModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">Join the Conversation</span>
                <h3 className="font-serif text-2xl text-white mt-1">Comment on {place.name || place.title}</h3>
              </div>

              {commentSuccess && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs text-center">
                  ✓ {commentSuccess}
                </div>
              )}

              {commentError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
                  ⚠️ {commentError}
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono text-white/60">Your Comment *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Share tips, travel notes, or questions for other travelers..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="w-full py-3.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  {commentSubmitting ? 'Posting...' : 'Post Comment 💬'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
