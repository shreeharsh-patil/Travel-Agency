import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function GalleryPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    src: '',
    caption: '',
    alt: '',
    category: 'Scenery'
  });

  const categories = ['All', 'Scenery', 'People', 'Beach', 'Culture', 'Luxury', 'Adventure'];

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/images');
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Gallery is temporarily unavailable.');
      if (Array.isArray(data.images)) {
        setImages(data.images);
        setSource(data.source || '');
      }
    } catch (err) {
      setError(err.message || 'Could not load gallery photos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    try {
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
        body: JSON.stringify({ image: base64Data, folder: 'horizon_gallery' })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUploadForm((prev) => ({
          ...prev,
          src: data.url,
          alt: prev.alt || file.name.replace(/\.[^/.]+$/, '')
        }));
      } else {
        throw new Error(data.error || 'Failed to upload photo.');
      }
    } catch (err) {
      console.error('Gallery photo upload error:', err);
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveGalleryImage = async (e) => {
    e.preventDefault();
    if (!uploadForm.src) {
      setUploadError('Please select or upload a photo first.');
      return;
    }
    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save gallery photo.');

      setUploadSuccess('Original photo added to Moments gallery!');
      setUploadForm({ src: '', caption: '', alt: '', category: 'Scenery' });
      fetchGalleryImages();
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(null);
      }, 1200);
    } catch (err) {
      console.error('Save gallery error:', err);
      setUploadError(err.message || 'Could not save image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imgId, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this photo from the gallery?')) return;
    try {
      const res = await fetch(`/api/images?id=${imgId}`, { method: 'DELETE' });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img._id !== imgId && img.id !== imgId));
      }
    } catch (err) {
      console.error('Delete gallery image error:', err);
    }
  };

  const filteredImages = images.filter((img) => {
    if (selectedCategory === 'All') return true;
    return String(img.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <section className="min-h-screen bg-[#0c0c0c] text-white pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-[1920px] mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block">
            Original Travel Photography
          </span>
          <h1 className="font-serif text-6xl md:text-8xl leading-none opacity-90">
            Moments.
          </h1>
          <p className="font-sans text-sm md:text-base opacity-60 max-w-xl mx-auto tracking-wide">
            Capturing authentic landscapes, cultural sanctuaries, and timeless journeys around the world.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-gold text-black font-bold shadow-lg shadow-brand-gold/20'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-brand-gold transition-colors shadow-lg flex items-center gap-2"
            >
              <span>📸</span>
              <span>+ Add Original Photo</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-white/60">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest">Loading verified gallery photos</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <h2 className="font-serif text-2xl text-white">Gallery temporarily unavailable</h2>
            <p className="mt-3 text-sm text-white/60">{error}</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center space-y-4">
            <span className="text-4xl block">📷</span>
            <h2 className="font-serif text-2xl text-white">No photos in {selectedCategory} yet</h2>
            <p className="text-sm text-white/60">Be the first to share an original camera photo in this category!</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-block rounded-full bg-brand-gold px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white"
            >
              + Upload Original Photo
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredImages.map((item) => (
              <motion.div
                layoutId={`container-${item._id || item.id}`}
                key={item._id || item.id}
                className="relative group cursor-pointer break-inside-avoid rounded-3xl overflow-hidden border border-white/10 bg-[#121214] shadow-2xl"
                onClick={() => setSelectedId(item._id || item.id)}
              >
                <motion.img
                  layoutId={`image-${item._id || item.id}`}
                  src={item.src}
                  alt={item.alt || item.caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-brand-gold uppercase">
                      {item.category || 'Moments'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteImage(item._id || item.id, e)}
                      className="w-7 h-7 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors"
                      title="Delete photo"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-white mb-1">{item.caption || item.alt}</h4>
                    <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Click to Expand ↗</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fullscreen Lightbox */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
              onClick={() => setSelectedId(null)}
            >
              {images.map((item) => {
                if (item._id === selectedId || item.id === selectedId) {
                  return (
                    <motion.div
                      layoutId={`container-${item._id || item.id}`}
                      key={item._id || item.id}
                      className="relative max-w-6xl w-full max-h-full flex flex-col items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.img
                        layoutId={`image-${item._id || item.id}`}
                        src={item.src}
                        alt={item.alt || item.caption}
                        className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-6 text-center"
                      >
                        <h3 className="font-serif text-2xl md:text-4xl text-white mb-2">{item.caption || item.alt}</h3>
                        <p className="font-sans text-brand-gold text-xs uppercase tracking-widest font-mono">{item.category}</p>
                      </motion.div>

                      <button
                        onClick={() => setSelectedId(null)}
                        className="absolute -top-10 right-0 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-mono transition-colors"
                      >
                        CLOSE [X]
                      </button>
                    </motion.div>
                  );
                }
                return null;
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPLOAD ORIGINAL PHOTO MODAL */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#121214] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl"
              >
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">Moments Gallery</span>
                    <h3 className="font-serif text-2xl text-white">Upload Original Photo</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>

                {uploadSuccess && (
                  <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs text-center font-mono">
                    ✓ {uploadSuccess}
                  </div>
                )}

                {uploadError && (
                  <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center font-mono">
                    ⚠️ {uploadError}
                  </div>
                )}

                <form onSubmit={handleSaveGalleryImage} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-white/60">Photo File (Cloudinary)</label>
                    <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-center hover:border-brand-gold/50 transition-colors">
                      <input
                        type="file"
                        id="galleryUploadInput"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <label htmlFor="galleryUploadInput" className="cursor-pointer inline-flex flex-col items-center gap-2">
                        <span className="text-3xl">📸</span>
                        <span className="text-sm text-white font-medium">
                          {uploading ? 'Uploading to Cloudinary...' : 'Click to select original camera photo'}
                        </span>
                        <span className="text-xs text-white/40">PNG, JPG, or WebP</span>
                      </label>
                    </div>

                    {uploadForm.src && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-brand-gold/40 mt-3">
                        <img src={uploadForm.src} alt="Upload preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-brand-gold">
                          ✓ Uploaded to Cloudinary
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Caption / Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunset reflections over Lake Como"
                      value={uploadForm.caption}
                      onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value, alt: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-mono text-white/60">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none"
                    >
                      {['Scenery', 'People', 'Beach', 'Culture', 'Luxury', 'Adventure', 'Architecture'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-5 py-2.5 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !uploadForm.src}
                      className="px-7 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Saving...' : 'Add to Moments ✨'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
