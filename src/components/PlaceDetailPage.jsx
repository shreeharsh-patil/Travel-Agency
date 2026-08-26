import React, { useState, useEffect, useCallback, useRef } from 'react';
import { compressImageFile } from '../utils/imageCompression';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReservationForm from './ReservationForm';
import PlaceMap from './PlaceMap';
import CurrencyPrice from './CurrencyPrice';
import VisaChecker from './VisaChecker';
import { PlaceDetailSkeleton } from './Skeletons';
import SafeImage from './SafeImage';

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
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', images: [] });
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoUrlError, setPhotoUrlError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const photoFileInputRef = useRef(null);

  const handlePhotoFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same file later
    if (files.length === 0) return;
    setPhotoUrlError('');

    // Safe to snapshot: the upload button is disabled while compressing, so
    // no other interaction can mutate the images array concurrently.
    const currentCount = (reviewForm.images || []).length;
    const slots = Math.max(0, 6 - currentCount);
    if (slots <= 0) {
      setPhotoUrlError('Maximum 6 photos per review.');
      return;
    }

    setUploadingPhotos(true);
    try {
      const compressed = [];
      for (const file of files.slice(0, slots)) {
        try {
          const { dataUrl } = await compressImageFile(file);
          compressed.push(dataUrl);
        } catch (err) {
          setPhotoUrlError(err.message || 'Could not process one of the photos.');
        }
      }
      if (compressed.length > 0) {
        // Functional update so in-flight edits to title/rating/comment are never clobbered.
        setReviewForm((prev) => ({ ...prev, images: [...(prev.images || []), ...compressed] }));
      }
    } finally {
      setUploadingPhotos(false);
    }
  };

  const addPhotoUrl = () => {
    const trimmed = photoUrlInput.trim();
    setPhotoUrlError('');
    if (!trimmed) return;
    if (!/^https?:\/\/\S+$/i.test(trimmed)) {
      setPhotoUrlError('Please enter a valid http(s) image URL.');
      return;
    }
    if ((reviewForm.images || []).length >= 6) {
      setPhotoUrlError('Maximum 6 photos per review.');
      return;
    }
    if ((reviewForm.images || []).includes(trimmed)) {
      setPhotoUrlError('That photo is already added.');
      return;
    }
    setReviewForm({ ...reviewForm, images: [...(reviewForm.images || []), trimmed] });
    setPhotoUrlInput('');
  };
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [wikiData, setWikiData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [travelAdvisory, setTravelAdvisory] = useState(null);
  const [nearbyLandmarks, setNearbyLandmarks] = useState([]);
  const [packingGuide, setPackingGuide] = useState(null);
  const [transitData, setTransitData] = useState(null);
  const [festivalsData, setFestivalsData] = useState([]);
  const [itineraryData, setItineraryData] = useState([]);
  const [gastronomyData, setGastronomyData] = useState(null);
  const [visaData, setVisaData] = useState(null);
  const [selectedPassport, setSelectedPassport] = useState('IN');
  const [explorerPhotos, setExplorerPhotos] = useState([]);
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
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [commentLikeBusy, setCommentLikeBusy] = useState({});
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
      const placeLat = Number(data.place.lat);
      const placeLon = Number(data.place.lon);

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

      // Fetch live weather
      fetch(`/api/weather?city=${encodeURIComponent(data.place.name || slug)}`)
        .then(r => r.json())
        .then(w => setWeatherData(w))
        .catch(() => {});

      // Fetch Wikipedia summary
      fetch(`/api/wiki-summary?q=${encodeURIComponent(data.place.name || slug)}`)
        .then(r => r.json())
        .then(w => {
          if (w && w.extract) setWikiData(w);
        })
        .catch(() => {});

      // Fetch Country Intelligence & Traveler Essentials
      fetch(`/api/country-info?country=${encodeURIComponent(data.place.country || 'India')}`)
        .then(r => r.json())
        .then(c => {
          if (c && c.countryName) setCountryData(c);
        })
        .catch(() => {});

      // Fetch Official Travel Advisory & Safety
      fetch(`/api/travel-advisory?country=${encodeURIComponent(data.place.country || 'India')}`)
        .then(r => r.json())
        .then(ta => {
          if (ta && ta.title) setTravelAdvisory(ta);
        })
        .catch(() => {});

      // Fetch Smart Packing Checklist
      fetch(`/api/smart-packing?category=${encodeURIComponent(data.place.category || 'Beach')}&days=4`)
        .then(r => r.json())
        .then(pg => {
          if (pg && pg.checklist) setPackingGuide(pg);
        })
        .catch(() => {});

      // Fetch Public Transit & Airport Intelligence
      fetch(`/api/transit-hub?destination=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(th => {
          if (th && th.transit) setTransitData(th.transit);
        })
        .catch(() => {});

      // Fetch Cultural Festivals & Seasonal Calendar
      fetch(`/api/festivals?destination=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(fs => {
          if (fs && Array.isArray(fs.festivals) && fs.festivals.length > 0) {
            setFestivalsData(fs.festivals);
          }
        })
        .catch(() => {});

      // Fetch AI Day-by-Day Journey Itinerary
      fetch(`/api/ai-itinerary?destination=${encodeURIComponent(data.place.name || slug)}&days=4`)
        .then(r => r.json())
        .then(it => {
          if (it && Array.isArray(it.itinerary)) setItineraryData(it.itinerary);
        })
        .catch(() => {});

      // Fetch Gastronomy & Culinary Guide
      fetch(`/api/gastronomy?destination=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(gs => {
          if (gs && gs.gastronomy) setGastronomyData(gs.gastronomy);
        })
        .catch(() => {});

      // Fetch Visa Requirements
      fetch(`/api/visa-requirements?destination=${encodeURIComponent(slug)}&passport=IN`)
        .then(r => r.json())
        .then(v => {
          if (v && v.requirements) setVisaData(v.requirements);
        })
        .catch(() => {});

      // Fetch Real Explorer Photography
      fetch(`/api/external-images?query=${encodeURIComponent(data.place.name || slug)}&limit=6`)
        .then(r => r.json())
        .then(ep => {
          if (Array.isArray(ep.images) && ep.images.length > 0) {
            setExplorerPhotos(ep.images);
          }
        })
        .catch(() => {});



      // Only request location services when this place actually has coordinates
      if (Number.isFinite(placeLat) && Number.isFinite(placeLon)) {
        fetch(`/api/sun-times?lat=${placeLat}&lon=${placeLon}`)
          .then(r => r.json())
          .then(s => setSunTimesData(s))
          .catch(() => {});

        fetch(`/api/uv-index?lat=${placeLat}&lon=${placeLon}`)
          .then(r => r.json())
          .then(u => setUvIndex(u))
          .catch(() => {});

        fetch(`/api/air-quality?lat=${placeLat}&lon=${placeLon}`)
          .then(r => r.json())
          .then(aq => setAirQualityData(aq))
          .catch(() => {});

        // Fetch Nearby Cultural Monuments within 10km (Wikipedia Geosearch)
        fetch(`/api/nearby-cultural?lat=${placeLat}&lon=${placeLon}&radius=10000`)
          .then(r => r.json())
          .then(nc => {
            if (Array.isArray(nc.landmarks) && nc.landmarks.length > 0) {
              setNearbyLandmarks(nc.landmarks);
            }
          })
          .catch(() => {});
      }

      // Fetch free attractions
      fetch(`/api/free-attractions?destination=${encodeURIComponent(data.place.name || slug)}`)
        .then(r => r.json())
        .then(fa => setFreeAttractions(fa.attractions || []))
        .catch(() => {});


      // Fetch trip expense estimate (INR) — handled in a dedicated effect
      // so changing days/travellers doesn't reload the whole page.

    } catch (err) {
      console.error('Fetch place detail error:', err);
      setError('Could not load place details.');
    } finally {
      setLoading(false);
    }
  }, [slug]);


  const checkIsSaved = useCallback(async () => {
    try {
      const session = await fetch('/api/auth/me');
      const sessionData = session.ok ? await session.json() : null;
      if (!sessionData?.user) {
        setIsSaved(false);
        return;
      }
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.placeIds && data.placeIds.includes(slug));
      }
    } catch (err) {
      console.error('Check saved error:', err);
    }
  }, [slug]);

  const handlePassportChange = async (passportCode) => {
    setSelectedPassport(passportCode);
    try {
      const res = await fetch(`/api/visa-requirements?destination=${encodeURIComponent(slug)}&passport=${passportCode}`);
      const data = await res.json();
      if (data.requirements) setVisaData(data.requirements);
    } catch {}
  };

  useEffect(() => {
    fetchPlaceAndReviews();
    checkIsSaved();
  }, [fetchPlaceAndReviews, checkIsSaved]);


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
    try {
      const session = await fetch('/api/auth/me');
      const sessionData = session.ok ? await session.json() : null;
      if (!sessionData?.user) {
        alert('Please log in to save places to your favorites.');
        return;
      }
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          place_id: slug,
          place_name: place?.name || place?.title,
          place_image: place?.image,
          place_price: place?.price
        })
      });

      const data = await res.json();
      if (res.status === 401) {
        alert('Please log in to save places to your favorites.');
      } else if (res.ok) {
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

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          place_id: place.slug || place.id || slug,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          images: (reviewForm.images || []).filter(Boolean).slice(0, 6)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit review.');
      }

      setReviewSuccess('Your review has been submitted successfully!');
      setReviewForm({ rating: 5, title: '', comment: '', images: [] });
      setPhotoUrlInput('');
      setShowUrlInput(false);
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

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  // Like / unlike a comment (top-level or reply)
  const toggleCommentLike = async (comment) => {
    if (commentLikeBusy[comment._id]) return;

    setCommentLikeBusy((prev) => ({ ...prev, [comment._id]: true }));
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: comment._id, action: comment.likedByUser ? 'unlike' : 'like' })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not update like.');
      }
      const data = await res.json();

      setComments((prev) => prev.map((root) => {
        const updateNode = (node) => {
          if (node._id === comment._id) {
            return { ...node, likedByUser: data.liked, likeCount: data.likeCount };
          }
          return { ...node, replies: (node.replies || []).map(updateNode) };
        };
        return updateNode(root);
      }));
    } catch (err) {
      console.error('Toggle comment like error:', err);
    } finally {
      setCommentLikeBusy((prev) => ({ ...prev, [comment._id]: false }));
    }
  };

  // Submit a reply to a comment
  const handleReplySubmit = async (parentComment) => {
    if (!replyText.trim()) return;

    setReplySubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          place_id: place.slug || place.id || slug,
          text: replyText,
          parent_id: parentComment._id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not post reply.');
      }

      setComments((prev) => prev.map((root) => {
        if (root._id === parentComment._id) {
          return { ...root, replies: [data.comment, ...(root.replies || [])] };
        }
        return root;
      }));
      setReplyText('');
      setReplyTarget(null);
    } catch (err) {
      setCommentError(err.message || 'Failed to post reply.');
    } finally {
      setReplySubmitting(false);
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
      <section className="min-h-screen w-full bg-[#0c0c0c] pt-28 pb-24 px-4 sm:px-8">
        <PlaceDetailSkeleton />
      </section>
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
          <SafeImage
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
          <div className="absolute bottom-6 left-5 right-5 sm:bottom-8 sm:left-12 sm:right-12 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 z-10">
            <div>
              <span className="text-xs font-mono text-white/70 uppercase tracking-widest block mb-1">
                📍 {place.city ? `${place.city}, ` : ''}{place.state_region ? `${place.state_region}, ` : ''}{place.country}
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl text-white">{place.name || place.title}</h1>
              <p className="text-white/80 text-sm italic mt-1 max-w-xl">{place.tagline || place.description?.slice(0, 100)}...</p>
            </div>

            <div className="w-full md:w-auto bg-black/60 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0 md:min-w-[260px]">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase block">Starting Package</span>
                <span className="font-mono text-2xl text-brand-gold font-bold">
                  <CurrencyPrice amount={place.priceFrom || 35000} />
                </span>
              </div>
              <button
                onClick={() => setShowReserveModal(true)}
                className="min-h-11 w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-brand-gold transition-colors"
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

            {/* Amenities & Features */}

            {place.amenities && place.amenities.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      ✨ Features & Perks
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">What this sanctuary offers</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {place.amenities.map((amenityKey) => {
                    const labels = {
                      wifi: { name: 'Fast WiFi', icon: '📶' },
                      pool: { name: 'Swimming Pool', icon: '🏊‍♂️' },
                      ac: { name: 'Air Conditioning', icon: '❄️' },
                      parking: { name: 'Free Parking', icon: '🚗' },
                      kitchen: { name: 'Gourmet Kitchen', icon: '🍳' },
                      pets: { name: 'Pet Friendly', icon: '🐾' },
                      view: { name: 'Scenic / Ocean View', icon: '🌅' },
                      spa: { name: 'Spa & Wellness', icon: '🧘' },
                      workspace: { name: 'Dedicated Workspace', icon: '💻' },
                      security: { name: '24/7 Security', icon: '🛡️' }
                    };
                    const item = labels[amenityKey] || { name: amenityKey, icon: '✨' };
                    return (
                      <div key={amenityKey} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90">
                        <span className="text-base">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Explorer Photos */}
            {explorerPhotos && explorerPhotos.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      📷 Authentic Travel Photography
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Real Explorer Photos: {place.name || place.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-white/50">{explorerPhotos.length} photos</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {explorerPhotos.map((photo, i) => (
                    <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={photo.src}
                        alt={photo.title || `${place.name} explorer photo`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <p className="text-[11px] text-white font-medium line-clamp-2">{photo.title}</p>
                        <span className="text-[9px] font-mono text-brand-gold mt-0.5">By {photo.author}</span>
                      </div>
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

            {/* Wikipedia Historical & Cultural Capsule */}
            {wikiData && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      📖 Heritage & Cultural Insights
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Cultural Insights: {wikiData.title}</h3>
                  </div>
                  {wikiData.wikiUrl && (
                    <a
                      href={wikiData.wikiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-white/50 hover:text-brand-gold transition-colors flex items-center gap-1"
                    >
                      Read full article ↗
                    </a>
                  )}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{wikiData.extract}</p>
              </div>
            )}


            {/* Live Weather Forecast & Air Quality (Free Open-Meteo APIs) */}
            {(weatherData || airQualityData || uvIndex) && (
              <div className="bg-[#141418] border border-brand-gold/30 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      ⚡ Live Destination Intelligence
                    </span>
                    <h4 className="font-serif text-2xl text-white mt-0.5">
                      {weatherData?.city || place.name} • {weatherData?.temperature || 'Live Conditions'}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weatherData?.condition && (
                      <span className="text-xs font-mono text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                        {weatherData.condition}
                      </span>
                    )}
                    {airQualityData && (
                      <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                        airQualityData.aqi <= 50
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : airQualityData.aqi <= 100
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        AQI {airQualityData.aqi} • {airQualityData.level}
                      </span>
                    )}
                  </div>
                </div>

                {weatherData?.forecast && (
                  <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                    {weatherData.forecast.map((f, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-white/40 block text-[10px] uppercase">{f.date}</span>
                        <span className="text-brand-gold font-bold">{f.maxTemp}</span>
                        <span className="text-white/40 block text-[10px]">{f.minTemp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {airQualityData?.advice && (
                  <p className="text-xs font-mono text-white/60 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    🌱 <strong>Eco Note:</strong> {airQualityData.advice}
                  </p>
                )}
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

            {/* Country Intelligence & Traveler Essentials (Free REST Countries Engine) */}
            {countryData && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{countryData.flagEmoji}</span>
                    <div>
                      <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                        Traveler Essentials
                      </span>
                      <h3 className="font-serif text-2xl text-white mt-0.5">{countryData.countryName} Travel Guide</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 self-start sm:self-auto">
                    {countryData.region}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Capital & Time</span>
                    <span className="text-white font-medium block">{countryData.capital}</span>
                    <span className="text-brand-gold text-[11px] font-mono block">{countryData.timeZone}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Currency & Calling</span>
                    <span className="text-white font-medium block">{countryData.currency}</span>
                    <span className="text-brand-gold text-[11px] font-mono block">Code: {countryData.callingCode}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Power & Voltage</span>
                    <span className="text-white font-medium block">{countryData.powerPlugs}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Driving Side</span>
                    <span className="text-white font-medium block">{countryData.drivingSide} Side</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Emergency SOS</span>
                    <span className="text-red-400 font-bold block">{countryData.emergencyNumber}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Best Season</span>
                    <span className="text-green-400 font-medium block">{countryData.bestMonths}</span>
                  </div>
                </div>

                {/* Spoken Local Language Phrases */}
                {countryData.phrases && countryData.phrases.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🗣️ Essential Local Phrases ({countryData.languages.split(',')[0]})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {countryData.phrases.map((phrase, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-white text-xs font-semibold block">{phrase.text}</span>
                            <span className="text-brand-gold/80 text-[10px] font-mono block italic">"{phrase.pronunciation}"</span>
                          </div>
                          <span className="text-white/50 text-[11px] font-medium text-right">{phrase.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Travel Advisory & Safety Guidelines */}
            {travelAdvisory && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🛡️ Official Safety & Entry Intelligence
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">{travelAdvisory.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    Verified Advisory
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{travelAdvisory.summary}</p>
                {travelAdvisory.advisorySnippet && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-white/70 font-mono leading-relaxed">
                    📌 {travelAdvisory.advisorySnippet}
                  </div>
                )}
                {travelAdvisory.topics && travelAdvisory.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {travelAdvisory.topics.slice(0, 5).map((topic, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-mono">
                        ✓ {topic.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Smart Packing Checklist */}
            {packingGuide && packingGuide.checklist && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🎒 Climate & Itinerary Preparation
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Curated Packing Guide</h3>
                  </div>
                  <span className="text-xs font-mono text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                    {packingGuide.destinationCategory} Edition
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packingGuide.checklist.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-brand-gold text-sm font-mono">▫</span>
                        <span className="text-white/90 font-medium">{item.item}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">{item.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Cultural & Historic Landmarks */}
            {nearbyLandmarks && nearbyLandmarks.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🏛️ Nearby Heritage & Monuments (Within 10km)
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Historic Vicinity Explorer</h3>
                  </div>
                  <span className="text-xs font-mono text-white/50">{nearbyLandmarks.length} Sites</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nearbyLandmarks.map((lm) => (
                    <a
                      key={lm.id}
                      href={lm.wikiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/50 transition-all flex items-center justify-between text-xs group"
                    >
                      <div>
                        <span className="text-white font-medium group-hover:text-brand-gold transition-colors block">
                          {lm.title}
                        </span>
                        <span className="text-white/40 text-[10px] font-mono">{lm.distanceKm} km away</span>
                      </div>
                      <span className="text-white/40 group-hover:text-white transition-colors text-sm">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Airport & Multimodal Public Transit Intelligence */}
            {transitData && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🚆 Airport & Multimodal Transit Hub
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Arrival & Transit Access</h3>
                  </div>
                  {transitData.metroAvailable && (
                    <span className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      Metro Subway Connected
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-xs">
                  {transitData.airports && transitData.airports.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Airport Gateways</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {transitData.airports.map((ap, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-white font-semibold">{ap.name}</span>
                              <span className="text-brand-gold font-mono text-[10px]">{ap.distance}</span>
                            </div>
                            <p className="text-white/60 text-[11px]">{ap.type} • {ap.transferTime}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {transitData.railway && transitData.railway.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Railway & Express Stations</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {transitData.railway.map((rw, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-white font-semibold">{rw.name}</span>
                              <span className="text-brand-gold font-mono text-[10px]">{rw.distance}</span>
                            </div>
                            <p className="text-white/60 text-[11px]">{rw.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {transitData.localTransit && (
                    <p className="text-[11px] font-mono text-white/70 bg-white/[0.02] p-3 rounded-xl border border-white/5 mt-2">
                      🚗 <strong>Local Mobility:</strong> {transitData.localTransit}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cultural Festivals & Seasonal Calendar */}
            {festivalsData && festivalsData.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🎭 Cultural Festivals & Celebrations
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Seasonal Events Calendar</h3>
                  </div>
                  <span className="text-xs font-mono text-white/50">{festivalsData.length} Highlights</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {festivalsData.map((ev, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-white">{ev.name}</span>
                        <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20 font-bold">
                          {ev.month}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{ev.description}</p>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Category: {ev.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Day-by-Day Journey Itinerary */}
            {itineraryData && itineraryData.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      ✨ AI Day-by-Day Journey Planner
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Curated Daily Itinerary</h3>
                  </div>
                  <span className="text-xs font-mono text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                    {itineraryData.length} Days Experience
                  </span>
                </div>

                <div className="space-y-4">
                  {itineraryData.map((d) => (
                    <div key={d.day} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-gold text-black font-bold text-xs flex items-center justify-center font-mono">
                          D{d.day}
                        </span>
                        <h4 className="font-serif text-lg text-white">{d.title}</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-brand-gold font-mono text-[10px] uppercase font-bold block">🌅 Morning</span>
                          <p className="text-white/70">{d.morning}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-brand-gold font-mono text-[10px] uppercase font-bold block">☀️ Afternoon</span>
                          <p className="text-white/70">{d.afternoon}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-brand-gold font-mono text-[10px] uppercase font-bold block">🌇 Golden Hour & Sunset</span>
                          <p className="text-white/70">{d.sunset}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                          <span className="text-brand-gold font-mono text-[10px] uppercase font-bold block">🍷 Evening & Gastronomy</span>
                          <p className="text-white/70">{d.dinner}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passport & Visa Entry Requirements Checker */}
            {visaData && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🛂 Passport & Visa Intelligence
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">Entry Protocols & Requirements</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-white/50">My Passport:</span>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                      {['IN', 'US', 'GB', 'EU'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handlePassportChange(code)}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                            selectedPassport === code
                              ? 'bg-white text-black shadow'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {code === 'IN' ? '🇮🇳 IN' : code === 'US' ? '🇺🇸 US' : code === 'GB' ? '🇬🇧 UK' : '🇪🇺 EU'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📋</span>
                      <span className="text-sm font-semibold text-white">{visaData.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-mono font-bold border border-green-500/30">
                        {visaData.badge}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
                        Stay: {visaData.stay}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed font-mono pt-1">
                    {visaData.note}
                  </p>
                </div>
              </div>
            )}

            {/* Regional Gastronomy & Culinary Guide */}
            {gastronomyData && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🍽️ Culinary Heritage & Flavors
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-0.5">{gastronomyData.destination} Gastronomy Guide</h3>
                  </div>
                  <span className="text-xs font-mono text-white/40">Signature Dishes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gastronomyData.signatureDishes.map((dish, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🍲</span>
                        <h5 className="font-semibold text-xs text-white">{dish.name}</h5>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{dish.description}</p>
                    </div>
                  ))}
                </div>

                {gastronomyData.drinks && gastronomyData.drinks.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                      🍸 Signature Beverages & Spirits
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {gastronomyData.drinks.map((dr, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-white/80 text-xs font-mono border border-white/10">
                          {dr}
                        </span>
                      ))}
                    </div>
                    {gastronomyData.dietaryNotes && (
                      <p className="text-[11px] font-mono text-white/50 pt-1">
                        🥗 <strong>Dietary Advice:</strong> {gastronomyData.dietaryNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}






            {/* Local Landmarks & Scenic Viewpoints */}
            {freeAttractions.length > 0 && (
              <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-mono text-brand-gold uppercase tracking-widest block">
                      Local Landmarks & Nature Walks
                    </span>
                    <h3 className="font-serif text-2xl text-white mt-1">Highlights & Scenic Viewpoints</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-medium">
                    Complimentary Access
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

                <div className="flex w-full flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center sm:w-auto">
                  <select
                    value={sortReviews}
                    onChange={(e) => setSortReviews(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none min-[420px]:w-auto"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>

                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="min-h-11 w-full px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-colors min-[420px]:w-auto"
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white block">{rev.user_name || 'Anonymous'}</span>
                              {rev.verified && (
                                <span className="text-[9px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                                  ✓ VERIFIED TRAVELER
                                </span>
                              )}
                            </div>
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

                      {/* Review photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                          {rev.images.filter((u) => typeof u === 'string' && (/^https?:\/\//i.test(u) || u.startsWith('data:image/'))).map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer" className="block h-20 sm:h-24 rounded-xl overflow-hidden border border-white/10 group/img">
                              <img
                                src={img}
                                alt={`${rev.user_name || 'Traveler'}'s review photo ${i + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                              />
                            </a>
                          ))}
                        </div>
                      )}
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
                  className="min-h-11 w-full px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-colors sm:w-auto"
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
                <div className="space-y-4">
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

                      {/* Comment Actions: Like + Reply */}
                      <div className="flex items-center gap-4 pt-1">
                        <button
                          onClick={() => toggleCommentLike(cmt)}
                          disabled={commentLikeBusy[cmt._id]}
                          className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                            cmt.likedByUser ? 'text-brand-gold' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          <span>{cmt.likedByUser ? '♥' : '♡'}</span>
                          <span>{cmt.likeCount || 0}</span>
                        </button>
                        <button
                          onClick={() => setReplyTarget(replyTarget === cmt._id ? null : cmt._id)}
                          className="text-[11px] font-mono text-white/40 hover:text-white transition-colors"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Inline Reply Form */}
                      {replyTarget === cmt._id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${cmt.user_name}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-gold focus:outline-none"
                          />
                          <button
                            onClick={() => handleReplySubmit(cmt)}
                            disabled={replySubmitting}
                            className="px-4 py-2 rounded-full bg-brand-gold text-black text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                          >
                            {replySubmitting ? '...' : 'Reply'}
                          </button>
                        </div>
                      )}

                      {/* Replies (one level deep) */}
                      {cmt.replies && cmt.replies.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-white/10 pl-4">
                          {cmt.replies.map((reply) => (
                            <div key={reply._id} className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.user_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                                    alt={reply.user_name}
                                    className="w-6 h-6 rounded-full bg-white/10 object-cover"
                                  />
                                  <span className="text-xs font-semibold text-white">{reply.user_name || 'Anonymous'}</span>
                                  <span className="text-[9px] text-white/40 font-mono">
                                    {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ''}
                                  </span>
                                </div>
                              </div>
                              <p className="text-white/70 text-xs leading-relaxed">{reply.text}</p>
                              <button
                                onClick={() => toggleCommentLike(reply)}
                                disabled={commentLikeBusy[reply._id]}
                                className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                                  reply.likedByUser ? 'text-brand-gold' : 'text-white/40 hover:text-white'
                                }`}
                              >
                                <span>{reply.likedByUser ? '♥' : '♡'}</span>
                                <span>{reply.likeCount || 0}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
                className="w-full py-3.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
              >
                Reserve Stay in {place.name || place.title}
              </button>
            </div>

            {/* Visa & Entry Requirements Checker */}
            <VisaChecker place={place} />

            {/* Expense Estimator Widget */}
            <div className="bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-5">
              <div>
                <span className="text-xs font-mono text-brand-gold uppercase tracking-widest block">💰 Trip Expense Estimator</span>
                <h4 className="font-serif text-xl text-white mt-1">Estimated Budget (INR)</h4>
              </div>                <div className="grid grid-cols-2 gap-3">
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
                    <div className="flex justify-between"><span className="text-white/50">Flights (return)</span><span className="text-white font-medium"><CurrencyPrice amount={expense.breakdown.flights.amount} /></span></div>
                    <div className="flex justify-between"><span className="text-white/50">Stay</span><span className="text-white font-medium"><CurrencyPrice amount={expense.breakdown.stay.amount} /></span></div>
                    <div className="flex justify-between"><span className="text-white/50">Food</span><span className="text-white font-medium"><CurrencyPrice amount={expense.breakdown.food.amount} /></span></div>
                    <div className="flex justify-between"><span className="text-white/50">Local Transport</span><span className="text-white font-medium"><CurrencyPrice amount={expense.breakdown.localTransport.amount} /></span></div>
                    <div className="flex justify-between"><span className="text-white/50">Activities</span><span className="text-white font-medium"><CurrencyPrice amount={expense.breakdown.activities.amount} /></span></div>
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
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto bg-[#141417] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
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

                {/* Review photos: file upload with auto-compression */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-white/60">
                    Photos (optional, up to 6) — auto-compressed
                  </label>

                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoFiles}
                  />

                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    disabled={uploadingPhotos || (reviewForm.images || []).length >= 6}
                    className="w-full border-2 border-dashed border-white/15 rounded-2xl px-4 py-5 text-center text-xs text-white/60 hover:border-brand-gold/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {uploadingPhotos ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                        Compressing & adding…
                      </span>
                    ) : (
                      <span>
                        <span className="block text-lg mb-1">📷</span>
                        Tap to upload photos
                        <span className="block text-[10px] text-white/40 mt-1">
                          JPG / PNG / WebP — resized to 1200px, typically ~90% smaller
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Secondary option: paste a direct image link */}
                  {!showUrlInput && !uploadingPhotos && (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="text-[10px] font-mono text-brand-gold hover:underline"
                    >
                      or paste an image link instead
                    </button>
                  )}
                  {showUrlInput && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={photoUrlInput}
                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPhotoUrl();
                          }
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-brand-gold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addPhotoUrl}
                        className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-mono hover:bg-white hover:text-black transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {photoUrlError && (
                    <p className="text-[10px] text-red-400 font-mono">⚠️ {photoUrlError}</p>
                  )}
                  {(reviewForm.images || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(reviewForm.images || []).map((img, i) => (
                        <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-white/15 group/thumb">
                          <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setReviewForm({ ...reviewForm, images: reviewForm.images.filter((_, idx) => idx !== i) })
                            }
                            className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-[10px] opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
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
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto bg-[#141417] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
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
                  className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
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
