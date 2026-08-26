import React, { useState, useEffect, useCallback } from 'react';

const EMPTY_POST = { title: '', category: 'Journal', excerpt: '', content: '', image: '', published: true };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    pendingPlaces: 0,
    approvedPlaces: 0,
    totalReviews: 0,
    pendingReviews: 0,
    averageRating: 4.8,
    totalUsers: 0,
    totalBlogPosts: 0,
    totalNewsletterSubscribers: 0,
    totalTrips: 0
  });

  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'reviews' | 'blog' | 'newsletter'
  const [pendingPlacesList, setPendingPlacesList] = useState([]);
  const [allPlacesList, setAllPlacesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Blog editor state
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postForm, setPostForm] = useState(EMPTY_POST);
  const [postSaving, setPostSaving] = useState(false);

  // Place Photo / Details Editor state
  const [editingPlace, setEditingPlace] = useState(null);
  const [placeUploading, setPlaceUploading] = useState(false);
  const [placeUploadError, setPlaceUploadError] = useState(null);
  const [placeSaving, setPlaceSaving] = useState(false);

  const notify = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats((prev) => statsData.stats || prev);
      }

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

      const revRes = await fetch('/api/reviews?admin=true');
      if (revRes.ok) {
        const rData = await revRes.json();
        setReviewsList(rData.reviews || []);
      }

      const blogRes = await fetch('/api/blog?admin=true');
      if (blogRes.ok) {
        const bData = await blogRes.json();
        setBlogPosts(bData.posts || []);
      }

      const newsRes = await fetch('/api/newsletter');
      if (newsRes.ok) {
        const nData = await newsRes.json();
        setSubscribers(nData.subscribers || []);
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handlePlaceStatus = async (placeId, status) => {
    try {
      const res = await fetch('/api/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: placeId, status })
      });
      if (res.ok) {
        notify(`Place status updated to ${status}!`);
        fetchAdminData();
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
        notify('Place deleted.');
        fetchAdminData();
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
        notify(`Review ${status.toLowerCase()}!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Update review error:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Review deleted.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  // ---- Blog CMS actions ----
  const startNewPost = () => {
    setEditingPostId(null);
    setPostForm(EMPTY_POST);
    setShowPostForm(true);
  };

  const startEditPost = (post) => {
    setEditingPostId(post._id);
    setPostForm({
      title: post.title || '',
      category: post.category || 'Journal',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      published: post.published !== false
    });
    setShowPostForm(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setPostSaving(true);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      const url = '/api/blog';
      const method = editingPostId ? 'PATCH' : 'POST';
      const body = editingPostId ? { id: editingPostId, ...postForm } : postForm;

      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save article.');

      notify(editingPostId ? 'Article updated.' : 'Article published!');
      setShowPostForm(false);
      setPostForm(EMPTY_POST);
      setEditingPostId(null);
      fetchAdminData();
    } catch (err) {
      console.error('Save post error:', err);
      notify('Could not save article.');
    } finally {
      setPostSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      const res = await fetch(`/api/blog?id=${postId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        notify('Article deleted.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  // ---- Place Photo / Details Actions ----
  const startEditPlace = (place) => {
    setEditingPlace({
      _id: place._id || place.id || place.slug,
      name: place.name || place.title || '',
      country: place.country || '',
      category: place.category || 'Luxury',
      priceFrom: place.priceFrom || 35000,
      description: place.description || '',
      image: place.image || '',
      gallery: Array.isArray(place.gallery) && place.gallery.length > 0 ? place.gallery : (place.image ? [place.image] : [])
    });
    setPlaceUploadError(null);
  };

  const handlePlaceFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPlaceUploading(true);
    setPlaceUploadError(null);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, folder: 'horizon_places' })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.error || 'Failed to upload photo.');
        }
      }

      if (uploadedUrls.length > 0) {
        setEditingPlace((prev) => {
          const newGallery = [...(prev.gallery || []), ...uploadedUrls].slice(0, 8);
          return {
            ...prev,
            image: prev.image || uploadedUrls[0],
            gallery: newGallery
          };
        });
        notify(`Uploaded ${uploadedUrls.length} original photo(s) to Cloudinary!`);
      }
    } catch (err) {
      console.error('Place photo upload error:', err);
      setPlaceUploadError(err.message || 'Image upload failed.');
    } finally {
      setPlaceUploading(false);
      e.target.value = '';
    }
  };

  const handleAutoFetchPlacePhotos = async () => {
    if (!editingPlace?.name) return;
    setPlaceUploading(true);
    setPlaceUploadError(null);
    try {
      const res = await fetch(`/api/external-images?query=${encodeURIComponent(editingPlace.name + ' ' + (editingPlace.country || ''))}&limit=6`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.images) && data.images.length > 0) {
        const fetchedUrls = data.images.map(img => img.src);
        setEditingPlace(prev => ({
          ...prev,
          image: prev.image || fetchedUrls[0],
          gallery: Array.from(new Set([...(prev.gallery || []), ...fetchedUrls])).slice(0, 8)
        }));
        notify(`Auto-fetched ${fetchedUrls.length} original photos from Wikimedia Open API!`);
      } else {
        throw new Error('No open photos found for this destination name.');
      }
    } catch (err) {
      console.error('Auto fetch place photos error:', err);
      setPlaceUploadError(err.message || 'Auto-fetch failed.');
    } finally {
      setPlaceUploading(false);
    }
  };

  const removePlaceGalleryImage = (idx) => {
    setEditingPlace((prev) => {
      const newGallery = prev.gallery.filter((_, i) => i !== idx);
      return {
        ...prev,
        gallery: newGallery,
        image: newGallery.length > 0 ? newGallery[0] : ''
      };
    });
  };

  const setAsCoverPhoto = (imgUrl) => {
    setEditingPlace((prev) => ({
      ...prev,
      image: imgUrl
    }));
    notify('Set as cover photo!');
  };

  const handleSavePlaceDetails = async (e) => {
    e.preventDefault();
    if (!editingPlace) return;
    setPlaceSaving(true);

    try {
      const res = await fetch('/api/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPlace._id,
          name: editingPlace.name,
          country: editingPlace.country,
          category: editingPlace.category,
          priceFrom: editingPlace.priceFrom,
          description: editingPlace.description,
          image: editingPlace.image,
          gallery: editingPlace.gallery
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update place photos.');

      notify('Place details and original photos saved successfully!');
      setEditingPlace(null);
      fetchAdminData();
    } catch (err) {
      console.error('Save place photos error:', err);
      notify(err.message || 'Could not update place.');
    } finally {
      setPlaceSaving(false);
    }
  };

  const statCards = [
    { label: 'Total Places', val: stats.totalPlaces, icon: '🏝️' },
    { label: 'Pending Places', val: stats.pendingPlaces, icon: '⏳', highlight: stats.pendingPlaces > 0 },
    { label: 'Approved Places', val: stats.approvedPlaces, icon: '✓' },
    { label: 'Total Reviews', val: stats.totalReviews, icon: '✍️' },
    { label: 'Pending Reviews', val: stats.pendingReviews, icon: '🔎' },
    { label: 'Avg Rating', val: `★ ${stats.averageRating}`, icon: '⭐' },
    { label: 'Users', val: stats.totalUsers, icon: '👤' },
    { label: 'Newsletter', val: stats.totalNewsletterSubscribers, icon: '✉️' },
    { label: 'Blog Posts', val: stats.totalBlogPosts, icon: '📰' },
    { label: 'Trips Saved', val: stats.totalTrips, icon: '🧳' }
  ];

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((s, idx) => (
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
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('places')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'places'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Places ({pendingPlacesList.length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'reviews'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Reviews ({reviewsList.length})
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'blog'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Blog CMS ({blogPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'newsletter'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Newsletter ({subscribers.length})
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

            <div className="pt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl text-white">All Public & Approved Places ({allPlacesList.length})</h3>
                <span className="text-xs font-mono text-white/50">Click "Edit Photos" on any sanctuary to upload original camera pictures</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {allPlacesList.map((p) => {
                  const galleryCount = Array.isArray(p.gallery) ? p.gallery.length : (p.image ? 1 : 0);
                  return (
                    <div key={p._id || p.id} className="p-4 rounded-3xl bg-[#121214] border border-white/10 hover:border-brand-gold/40 transition-all space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                          <img
                            src={p.image || (p.gallery && p.gallery[0]) || '/images/tropical_beach.png'}
                            alt={p.name || p.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/90">
                            📸 {galleryCount} {galleryCount === 1 ? 'photo' : 'photos'}
                          </span>
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-mono text-green-300">
                            APPROVED
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-mono text-brand-gold uppercase">{p.country || p.location}</span>
                            <span className="text-[10px] font-mono text-white/40">{p.category}</span>
                          </div>
                          <h5 className="font-serif text-xl text-white">{p.name || p.title}</h5>
                          <p className="font-mono text-xs text-brand-gold font-semibold mt-1">{p.price || `₹${(p.priceFrom || 35000).toLocaleString('en-IN')}`}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => startEditPlace(p)}
                          className="flex-1 py-2 px-3 rounded-xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-black font-mono text-xs font-semibold transition-all text-center"
                        >
                          📸 Edit Photos & Details
                        </button>
                        <button
                          onClick={() => handleDeletePlace(p._id || p.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 text-xs transition-colors"
                          title="Delete sanctuary"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
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

        {/* BLOG CMS TAB */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl text-white">Journal Articles ({blogPosts.length})</h3>
                <p className="text-white/50 text-xs mt-1">Create, edit, and publish stories for The Journal.</p>
              </div>
              <button
                onClick={startNewPost}
                className="px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                + New Article
              </button>
            </div>

            {/* Create / Edit form */}
            {showPostForm && (
              <form onSubmit={handleSavePost} className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-brand-gold/30 space-y-5">
                <h4 className="font-serif text-xl text-white">{editingPostId ? '✏️ Edit Article' : '✍️ New Article'}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs uppercase font-mono text-white/60">Title *</label>
                    <input
                      type="text"
                      required
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      placeholder="The Ultimate Guide to..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Category</label>
                    <input
                      type="text"
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Cover Image URL</label>
                    <input
                      type="url"
                      value={postForm.image}
                      onChange={(e) => setPostForm({ ...postForm, image: e.target.value })}
                      placeholder="/images/private_jet.png or https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs uppercase font-mono text-white/60">Excerpt</label>
                    <input
                      type="text"
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      placeholder="Short summary shown on the journal grid"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs uppercase font-mono text-white/60">Content *</label>
                    <textarea
                      rows="8"
                      required
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      placeholder="Write the full story... (separate paragraphs with blank lines)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-xs font-mono text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postForm.published}
                    onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })}
                    className="accent-brand-gold w-4 h-4"
                  />
                  Published (visible on The Journal)
                </label>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postSaving}
                    className="px-8 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {postSaving ? 'Saving...' : editingPostId ? 'Save Changes' : 'Publish Article'}
                  </button>
                </div>
              </form>
            )}

            {/* Posts list */}
            {blogPosts.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#121214] border border-white/10 text-center text-white/50">
                No articles yet. Write your first story!
              </div>
            ) : (
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div key={post._id} className="p-5 rounded-2xl bg-[#121214] border border-white/10 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      <img src={post.image} alt={post.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-white/40">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                            post.published !== false
                              ? 'bg-green-500/15 text-green-300'
                              : 'bg-yellow-500/15 text-yellow-300'
                          }`}>
                            {post.published !== false ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h5 className="font-serif text-lg text-white truncate">{post.title}</h5>
                        <p className="text-white/50 text-xs line-clamp-1">{post.excerpt || post.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEditPost(post)}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-mono hover:bg-white hover:text-black transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-mono hover:bg-red-500 hover:text-white transition-colors"
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

        {/* NEWSLETTER TAB */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white">Newsletter Subscribers ({subscribers.length})</h3>

            {subscribers.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#121214] border border-white/10 text-center text-white/50">
                No subscribers yet. The footer signup will grow this list.
              </div>
            ) : (
              <div className="bg-[#121214] border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub._id} className="border-b border-white/5 last:border-0">
                          <td className="px-6 py-3.5 text-white font-mono text-xs">{sub.email}</td>
                          <td className="px-6 py-3.5 text-white/50 text-xs font-mono">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLACE PHOTO & DETAILS EDIT MODAL */}
        {editingPlace && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#121214] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">Media & Details Manager</span>
                  <h3 className="font-serif text-2xl text-white">Edit Place: {editingPlace.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePlaceDetails} className="space-y-6">
                {/* Cloudinary Photos Uploader */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase font-mono text-white/60">
                      Destination Photo Gallery
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFetchPlacePhotos}
                        disabled={placeUploading}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 border border-white/20 disabled:opacity-50"
                        title="Auto-fetch high-resolution photos for this destination"
                      >
                        <span>⚡</span>
                        <span>Auto-Fetch Photos</span>
                      </button>
                      <span className="text-xs text-white/40">{editingPlace.gallery?.length || 0}/8 photos</span>
                    </div>
                  </div>

                  <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-center hover:border-brand-gold/50 transition-colors">
                    <input
                      type="file"
                      id="adminPlaceUploadInput"
                      multiple
                      accept="image/*"
                      onChange={handlePlaceFileUpload}
                      disabled={placeUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="adminPlaceUploadInput"
                      className="cursor-pointer inline-flex flex-col items-center gap-2"
                    >
                      <span className="text-3xl">📸</span>
                      <span className="text-sm text-white font-medium">
                        {placeUploading ? 'Uploading to Cloudinary...' : 'Click or Drag & Drop original camera photos here'}
                      </span>
                      <span className="text-xs text-white/40">Upload high-res PNG, JPG or WebP images</span>
                    </label>
                  </div>

                  {placeUploadError && (
                    <p className="text-xs text-red-400">⚠️ {placeUploadError}</p>
                  )}

                  {/* Gallery Thumbnails List */}
                  {editingPlace.gallery && editingPlace.gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {editingPlace.gallery.map((imgUrl, idx) => {
                        const isCover = editingPlace.image === imgUrl || (idx === 0 && !editingPlace.image);
                        return (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                            <img src={imgUrl} alt={`Place ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <button
                                type="button"
                                onClick={() => removePlaceGalleryImage(idx)}
                                className="self-end bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                title="Remove photo"
                              >
                                ✕
                              </button>
                              <button
                                type="button"
                                onClick={() => setAsCoverPhoto(imgUrl)}
                                className={`text-[10px] font-mono py-1 px-2 rounded-md ${
                                  isCover ? 'bg-brand-gold text-black font-bold' : 'bg-white/20 text-white hover:bg-white hover:text-black'
                                }`}
                              >
                                {isCover ? '★ Cover' : 'Set Cover'}
                              </button>
                            </div>
                            {isCover && (
                              <span className="absolute top-1 left-1 bg-brand-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Cover
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Place Name</label>
                    <input
                      type="text"
                      required
                      value={editingPlace.name}
                      onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Country</label>
                    <input
                      type="text"
                      required
                      value={editingPlace.country}
                      onChange={(e) => setEditingPlace({ ...editingPlace, country: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Category</label>
                    <select
                      value={editingPlace.category}
                      onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value })}
                      className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    >
                      {['Beach', 'Mountain', 'Historical', 'Religious', 'Adventure', 'Wildlife', 'Cultural', 'Luxury', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Price (₹ INR)</label>
                    <input
                      type="number"
                      value={editingPlace.priceFrom}
                      onChange={(e) => setEditingPlace({ ...editingPlace, priceFrom: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-white/60">Description</label>
                  <textarea
                    rows="3"
                    value={editingPlace.description}
                    onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingPlace(null)}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={placeSaving || placeUploading}
                    className="px-8 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {placeSaving ? 'Saving Changes...' : 'Save Photos & Details ✨'}
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

