import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchAdminData();
  }, []);

  const notify = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);
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
  };

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
      const token = localStorage.getItem('horizon_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
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
      const token = localStorage.getItem('horizon_token');
      const res = await fetch(`/api/blog?id=${postId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notify('Article deleted.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Delete post error:', err);
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
      </div>
    </section>
  );
}
