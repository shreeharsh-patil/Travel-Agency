import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AMENITY_OPTIONS = [
  { id: 'wifi', name: 'Fast WiFi', icon: '📶' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊‍♂️' },
  { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
  { id: 'parking', name: 'Free Parking', icon: '🚗' },
  { id: 'kitchen', name: 'Gourmet Kitchen', icon: '🍳' },
  { id: 'pets', name: 'Pet Friendly', icon: '🐾' },
  { id: 'view', name: 'Scenic / Ocean View', icon: '🌅' },
  { id: 'spa', name: 'Spa & Wellness', icon: '🧘' },
  { id: 'workspace', name: 'Dedicated Workspace', icon: '💻' },
  { id: 'security', name: '24/7 Security', icon: '🛡️' }
];

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
    gallery: [],
    amenities: [],
    location_address: '',
    website: '',
    google_maps_url: '',
    priceFrom: '35000'
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
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
    'Luxury',
    'Other'
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        // Read file as base64 data URL
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
          throw new Error(data.error || 'Failed to upload image.');
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => {
          const newGallery = [...prev.gallery, ...uploadedUrls].slice(0, 6);
          return {
            ...prev,
            image: prev.image || uploadedUrls[0],
            gallery: newGallery
          };
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => {
      const newGallery = prev.gallery.filter((_, i) => i !== index);
      return {
        ...prev,
        gallery: newGallery,
        image: newGallery.length > 0 ? newGallery[0] : ''
      };
    });
  };

  const toggleAmenity = (id) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(id);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== id)
          : [...prev.amenities, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        ...formData,
        gallery: formData.gallery.length > 0 ? formData.gallery : (formData.image ? [formData.image] : [])
      };

      const res = await fetch('/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit place.');
      }

      setSuccessMsg('Thank you! Your place submission with Cloudinary photos has been received and is currently under review by our admin team.');
      setFormData({
        name: '',
        country: '',
        state_region: '',
        city: '',
        description: '',
        category: 'Beach',
        image: '',
        gallery: [],
        amenities: [],
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
              Know an extraordinary beach, mountain peak, or luxury sanctuary? Add it with photos and amenities to Horizon Travels.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm text-center">
              ✓ {successMsg}
              <div className="mt-3">
                <button
                  onClick={() => navigate('/travel')}
                  className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-full uppercase tracking-wider"
                >
                  Explore Destinations
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

            {/* Cloudinary Multiple Photos Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-mono text-white/60">Photos & Media (Cloudinary)</label>
                <span className="text-xs text-white/40">{formData.gallery.length}/6 photos</span>
              </div>

              <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-center hover:border-brand-gold/50 transition-colors">
                <input
                  type="file"
                  id="photoUploadInput"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || formData.gallery.length >= 6}
                  className="hidden"
                />
                <label
                  htmlFor="photoUploadInput"
                  className="cursor-pointer inline-flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">📸</span>
                  <span className="text-sm text-white font-medium">
                    {uploading ? 'Uploading to Cloudinary...' : 'Click to select or drag & drop photos'}
                  </span>
                  <span className="text-xs text-white/40">PNG, JPG up to 5MB (Max 6 photos)</span>
                </label>
              </div>

              {uploadError && (
                <p className="text-xs text-red-400">⚠️ {uploadError}</p>
              )}

              {/* Uploaded Gallery Thumbnails */}
              {formData.gallery.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
                  {formData.gallery.map((imgUrl, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                      <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-black/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-brand-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities Selection */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-mono text-white/60">Amenities & Perks</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITY_OPTIONS.map((amenity) => {
                  const isChecked = formData.amenities.includes(amenity.id);
                  return (
                    <button
                      type="button"
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                        isChecked
                          ? 'bg-brand-gold/15 border-brand-gold text-brand-gold font-semibold shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{amenity.icon}</span>
                      <span>{amenity.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 space-y-1 font-mono">
              <p>📌 Moderation Workflow Note:</p>
              <p>Submitted places enter a <span className="text-brand-gold">PENDING</span> status and must be reviewed & approved by an administrator before appearing publicly in search and destination listings.</p>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 active:scale-[0.99] transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'Submitting Place...' : 'Submit Place for Review ✨'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
