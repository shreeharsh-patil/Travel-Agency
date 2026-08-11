import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SuggestPlacePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    state_region: '',
    city: '',
    description: '',
    category: 'Beach',
    image: '',
    location_address: '',
    website: '',
    google_maps_url: '',
    priceFrom: '35000'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const categories = [
    'Beach',
    'Mountain',
    'Historical',
    'Religious',
    'Adventure',
    'Wildlife',
    'Food',
    'Cultural',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const token = localStorage.getItem('horizon_token');
    if (!token) {
      setErrorMsg('Please log in first to submit a new place.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit place.');
      }

      setSuccessMsg('Thank you! Your place submission has been received and is currently under review by our admin team.');
      setFormData({
        name: '',
        country: '',
        state_region: '',
        city: '',
        description: '',
        category: 'Beach',
        image: '',
        location_address: '',
        website: '',
        google_maps_url: '',
        priceFrom: '35000'
      });
    } catch (err) {
      console.error('Suggest place error:', err);
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
        >
          <div className="border-b border-white/10 pb-6 text-center">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block mb-2">
              Community Contributions
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-white">Suggest a New Place</h1>
            <p className="text-white/60 text-sm mt-2 max-w-lg mx-auto">
              Know an extraordinary beach, mountain peak, or cultural sanctuary? Add it to Horizon Travels for moderation.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm text-center">
              ✓ {successMsg}
              <div className="mt-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-full uppercase tracking-wider"
                >
                  View My Submissions
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Place Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baga Beach or Dudhsagar Falls"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">State / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Goa"
                  value={formData.state_region}
                  onChange={(e) => setFormData({ ...formData, state_region: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Calangute"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-mono text-white/60">Description *</label>
              <textarea
                rows="4"
                required
                placeholder="Describe the place, unique highlights, atmosphere, and what makes it special..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Est. Package Price (₹ INR)</label>
                <input
                  type="number"
                  placeholder="35000"
                  value={formData.priceFrom}
                  onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Official Website (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-white/60">Google Maps Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 space-y-1 font-mono">
              <p>📌 Moderation Workflow Note:</p>
              <p>Submitted places enter a <span className="text-brand-gold">PENDING</span> status and must be reviewed & approved by an administrator before appearing publicly in search and destination listings.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
            >
              {loading ? 'Submitting Place...' : 'Submit Place for Review ✨'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
