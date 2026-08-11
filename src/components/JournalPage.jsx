import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogData } from '../data/blogData';

function formatDate(value) {
  if (!value) return 'Recently';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ArticleReader({ post, onClose }) {
  if (!post) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="min-h-full flex items-center justify-center p-4 sm:p-8"
      >
        <motion.article
          initial={{ scale: 0.96, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 24 }}
          className="relative w-full max-w-3xl bg-[#141417] border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 hover:text-white"
          >
            ✕
          </button>

          <div className="h-64 sm:h-80 overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-widest">
              <span>{formatDate(post.date || post.created_at)}</span>
              <span className="w-6 h-[1px] bg-white/20" />
              <span>{post.readTime || '6 min read'}</span>
              {post.category && post.category !== 'Journal' && (
                <>
                  <span className="w-6 h-[1px] bg-white/20" />
                  <span className="text-brand-gold">{post.category}</span>
                </>
              )}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl leading-tight text-white">{post.title}</h2>
            <p className="text-white/50 text-xs font-mono">By {post.author || 'Horizon Curators'}</p>

            <div className="space-y-4 text-white/75 text-sm sm:text-base leading-relaxed">
              {String(post.content || '').split('\n').filter(Boolean).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
}

export default function JournalPage() {
  const [posts, setPosts] = useState(null); // null = loading
  const [activePost, setActivePost] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
          return;
        }
      }
    } catch (err) {
      console.warn('[Journal] API unavailable, using bundled stories:', err);
    }
    setPosts(blogData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);


  return (
    <section className="min-h-screen bg-[#0c0c0c] text-white pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-24 py-10 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="font-serif text-[clamp(4rem,10vw,8rem)] leading-none">
              The Journal.
            </h1>
            <span className="px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] font-mono uppercase tracking-widest">
              Live
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <p className="max-w-xl font-sans text-lg text-white/60 leading-relaxed">
              Stories from the road, curations of the finest hotels, and expert advice on traversing the globe in style.
            </p>
            <p className="font-mono text-xs text-brand-gold uppercase tracking-widest">
              READ TIME: VARIES
            </p>
          </div>
        </div>

        {/* Blog Grid */}
        {!posts ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-white/50 mt-3 uppercase tracking-widest">Loading Stories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-20">
            {posts.map((post) => (
              <motion.article
                key={post._id || post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                onClick={() => setActivePost(post)}
                className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-10 items-start border-b border-white/5 pb-20 last:border-0"
              >
                {/* Image */}
                <div className="md:col-span-5 overflow-hidden rounded-xl">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-7 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs font-mono text-white/40 uppercase tracking-widest mb-6 flex-wrap">
                      <span>{formatDate(post.date || post.created_at)}</span>
                      <span className="w-8 h-[1px] bg-white/20" />
                      <span>{post.readTime || '6 min read'}</span>
                      {post.category && post.category !== 'Journal' && (
                        <>
                          <span className="w-8 h-[1px] bg-white/20" />
                          <span className="text-brand-gold">{post.category}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-6 group-hover:text-brand-gold transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="font-sans text-white/60 text-lg leading-relaxed mb-8">
                      {String(post.excerpt || post.content || '').substring(0, 200)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold group-hover:gap-4 transition-all duration-300">
                    Read Article <span className="text-brand-gold">→</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {activePost && <ArticleReader post={activePost} onClose={() => setActivePost(null)} />}
      </AnimatePresence>
    </section>
  );
}
