import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CurrencyPrice from './CurrencyPrice';

export default function SeasonalOffersPage() {
  const activeOffers = [
    {
      id: 'goa-monsoon-offer',
      title: 'Goa Coastal Villa Special — 20% Off',
      category: 'Seasonal Discount',
      originalPrice: 35000,
      discountedPrice: 28000,
      discountPercent: 20,
      validUntil: '31 Oct 2026',
      description: 'Book 3 nights or more at selected Panaji and Calangute luxury villas to enjoy complimentary catamaran sunset cruise and airport transfers.',
      image: 'https://images.unsplash.com/photo-1512343800234-840322ee8146?w=800&auto=format&fit=crop&q=80',
      slug: 'goa'
    },
    {
      id: 'kyoto-autumn-offer',
      title: 'Kyoto Autumn Maple Leaves Experience',
      category: 'Package Offer',
      originalPrice: 250000,
      discountedPrice: 215000,
      discountPercent: 14,
      validUntil: '30 Nov 2026',
      description: 'Includes private Gion tea ceremony, Shinkansen bullet train transfers, and Machiya townhouse accommodations.',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
      slug: 'kyoto'
    }
  ];

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em]">
            Curated Privileges
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white">
            Seasonal <span className="text-brand-gold italic">Offers & Packages</span>
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            All prices and discounts calculated server-side in Indian Rupees (₹). No expired offers shown.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121214] border border-brand-gold/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group"
            >
              <div className="h-64 relative overflow-hidden">
                <img src={offer.image} alt={offer.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 left-4 bg-brand-gold text-black font-bold font-mono px-3 py-1 rounded-full text-xs uppercase">
                  SAVE {offer.discountPercent}%
                </span>
                <span className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-white/80">
                  Valid until {offer.validUntil}
                </span>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block mb-1">{offer.category}</span>
                  <h3 className="font-serif text-2xl text-white group-hover:text-brand-gold transition-colors">{offer.title}</h3>
                  <p className="text-white/70 text-xs mt-2 leading-relaxed">{offer.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-xs text-white/40 line-through font-mono block">
                      <CurrencyPrice amount={offer.originalPrice} />
                    </span>
                    <span className="font-mono text-2xl text-brand-gold font-bold">
                      <CurrencyPrice amount={offer.discountedPrice} />
                    </span>
                  </div>

                  <Link
                    to={`/places/${offer.slug}`}
                    className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    View Offer →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
