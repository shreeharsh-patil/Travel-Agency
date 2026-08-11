import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function GuidesListingPage() {
  const guides = [
    {
      id: 'goa-guide',
      title: 'The Ultimate Goa Travel Guide',
      category: 'Destination Guide',
      readTime: '6 min read',
      excerpt: 'Discover secret beaches, Latin quarter cafes in Fontainhas, clifftop fortresses, and luxury private beachfront estates in Goa.',
      image: 'https://images.unsplash.com/photo-1512343800234-840322ee8146?w=800&auto=format&fit=crop&q=80',
      destination: 'Goa'
    },
    {
      id: 'kyoto-zen-guide',
      title: 'Kyoto Zen Temples & Secret Tea Houses',
      category: 'Cultural Tips',
      readTime: '8 min read',
      excerpt: 'Navigate Kyoto like a local. How to arrange after-hours tea ceremonies and Machiya stays outside public hours.',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
      destination: 'Kyoto'
    },
    {
      id: 'amalfi-yacht-guide',
      title: 'Sailing the Amalfi Coast & Capri',
      category: 'Luxury Sailing',
      readTime: '5 min read',
      excerpt: 'Chartering Riva yachts across Capri coves, lemon grove tastings, and cliffside infinity pool estates.',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
      destination: 'Amalfi Coast'
    }
  ];

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em]">
            Editorial & Insights
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white">
            Curated <span className="text-brand-gold italic">Travel Guides</span>
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Expert destination guides, visa information, cultural etiquette, and seasonal travel advice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121214] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group"
            >
              <div className="h-56 relative overflow-hidden">
                <img src={g.image} alt={g.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-brand-gold border border-brand-gold/30 uppercase">
                  {g.category}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 block mb-1">{g.readTime}</span>
                  <h3 className="font-serif text-2xl text-white group-hover:text-brand-gold transition-colors">{g.title}</h3>
                  <p className="text-white/60 text-xs mt-2 line-clamp-3 leading-relaxed">{g.excerpt}</p>
                </div>

                <Link
                  to={`/places/${g.destination.toLowerCase()}`}
                  className="inline-block w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-gold hover:text-black transition-colors"
                >
                  Explore {g.destination} →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
