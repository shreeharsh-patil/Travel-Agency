import React, { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    pendingPlaces: 0,
    approvedPlaces: 0,
    totalReviews: 0,
    pendingReviews: 0,
    averageRating: 4.8
  });

  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'reviews'
  const [pendingPlacesList, setPendingPlacesList] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);




  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);
      }

      // Fetch pending & all places
      const placesRes = await fetch('/api/places?status=PENDING');
      if (placesRes.ok) {
        const pData = await placesRes.json();
        setPendingPlacesList(pData.places || []);
      }

      const allPRes = await fetch('/api/places');
      if (allPRes.ok) {
        const allData = await allPRes.json();
        setAllPlacesList(allData.places || []);
      }

      // Fetch reviews
      const revRes = await fetch('/api/reviews?admin=true');
      if (revRes.ok) {
        const rData = await revRes.json();
        setReviewsList(rData.reviews || []);
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceStatus = async (placeId, status) => {
    try {
      const res = await fetch('/api/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: placeId, status })
      });
      if (res.ok) {
        setActionMsg(`Place status updated to ${status}!`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Update place status error:', err);
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm('Are you sure you want to delete this place permanently?')) return;
    try {
      const res = await fetch(`/api/places?id=${placeId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMsg('Place deleted.');
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Delete place error:', err);
    }
  };

  const handleReviewStatus = async (reviewId, status) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status })
      });
      if (res.ok) {
        setActionMsg(`Review ${status.toLowerCase()}!`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Update review error:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMsg('Review deleted.');
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block mb-1">System Management</span>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">Admin Moderation Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-white/60">Live Database Connected</span>
          </div>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-mono text-center">
            ✓ {actionMsg}
          </div>
        )}

        {/* Live DB Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Places', val: stats.totalPlaces, icon: '🏝️' },
            { label: 'Pending Places', val: stats.pendingPlaces, icon: '⏳', highlight: stats.pendingPlaces > 0 },
            { label: 'Approved Places', val: stats.approvedPlaces, icon: '✓' },
            { label: 'Total Reviews', val: stats.totalReviews, icon: '✍️' },
            { label: 'Pending Reviews', val: stats.pendingReviews, icon: '🔎' },
            { label: 'Avg Rating', val: `★ ${stats.averageRating}`, icon: '⭐' }
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${
                s.highlight
                  ? 'bg-brand-gold/10 border-brand-gold text-white'
                  : 'bg-[#121214] border-white/10 text-white'
              }`}
            >
              <span className="text-xl block mb-1">{s.icon}</span>
              <span className="text-[10px] font-mono text-white/50 uppercase block">{s.label}</span>
              <span className="font-mono text-2xl font-bold mt-1 block">{s.val}</span>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('places')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'places'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Place Submissions ({pendingPlacesList.length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'reviews'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            User Reviews ({reviewsList.length})
          </button>
        </div>

        {/* PLACES MODERATION TAB */}
        {activeTab === 'places' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white">Pending Place Submissions</h3>

            {pendingPlacesList.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#121214] border border-white/10 text-center text-white/50 space-y-2">
                <span className="text-3xl block">🎉</span>
                <p className="text-xs font-mono uppercase tracking-widest">No pending place submissions to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPlacesList.map((place) => (
                  <div key={place._id} className="p-6 rounded-3xl bg-[#121214] border border-brand-gold/30 flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="flex gap-4 items-start flex-1">
                      <img
                        src={place.image || '/images/tropical_beach.png'}
                        alt={place.name}
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-mono uppercase">
                            {place.category}
                          </span>
                          <span className="text-[10px] font-mono text-white/40">
                            Submitted by <strong className="text-white">{place.submitted_by_name || 'User'}</strong> on {place.created_at ? new Date(place.created_at).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                        <h4 className="font-serif text-2xl text-white">{place.name}</h4>
                        <p className="text-xs font-mono text-white/60">📍 {place.city ? `${place.city}, ` : ''}{place.country}</p>
                        <p className="text-xs text-white/80 line-clamp-2 mt-2">{place.description}</p>
                        <span className="font-mono text-sm font-bold text-brand-gold block mt-1">Est. {place.price}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto min-w-[140px]">
                      <button
                        onClick={() => handlePlaceStatus(place._id, 'APPROVED')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-green-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-green-400 transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handlePlaceStatus(place._id, 'REJECTED')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
                      >
                        ✕ Reject
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place._id)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-white/60 text-xs font-mono hover:bg-white/20 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Approved Places */}
            <div className="pt-8 space-y-4">
              <h3 className="font-serif text-2xl text-white">All Public & Approved Places ({allPlacesList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPlacesList.map((p) => (
                  <div key={p._id || p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-brand-gold uppercase">{p.country}</span>
                      <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">APPROVED</span>
                    </div>
                    <h5 className="font-serif text-lg text-white">{p.name || p.title}</h5>
                    <p className="font-mono text-xs text-white/60">{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS MODERATION TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white">All User Reviews ({reviewsList.length})</h3>
            
            {reviewsList.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#121214] border border-white/10 text-center text-white/50">
                No reviews found.
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev._id} className="p-5 rounded-2xl bg-[#121214] border border-white/10 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-brand-gold font-mono font-bold">★ {rev.rating}</span>
                        <span className="text-white font-semibold text-sm">{rev.title}</span>
                        <span className="text-[10px] font-mono text-white/40">By {rev.user_name || 'User'} for {rev.place_id}</span>
                      </div>
                      <p className="text-white/80 text-xs">{rev.comment}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleReviewStatus(rev._id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-lg bg-green-500 text-black text-xs font-bold uppercase"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-mono hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
