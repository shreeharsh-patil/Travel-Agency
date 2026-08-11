import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlannerService } from '../services/trips/plannerService';
import CurrencyPrice from './CurrencyPrice';

function PublicTripCard({ trip, idx }) {
  const shareUrl = `/my-trips?share=${trip.shareId}`;
  const dayCount = trip.durationDays || (trip.itineraryDays || []).length || 3;
  const interests = trip.interests || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.06 }}
      className="bg-[#121214] border border-white/10 hover:border-brand-gold/40 rounded-3xl p-6 space-y-5 transition-colors duration-500 flex flex-col"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">
          {dayCount} Days • {trip.destination}
        </span>
        <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
          {trip.userName || 'Traveler'}
        </span>
      </div>

      <div>
        <h3 className="font-serif text-2xl text-white leading-snug">
          {dayCount}-Day Escape to {trip.destination}
        </h3>
        <p className="text-white/50 text-xs font-mono mt-1.5">
          Budget: <CurrencyPrice amount={trip.budgetINR || trip.formattedBudget} /> • Party: {trip.travelers}
        </p>
      </div>

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {interests.map((interest, i) => (
            <span key={i} className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-full">
              {interest}
            </span>
          ))}
        </div>
      )}

      {(trip.itineraryDays || []).slice(0, 2).map((day) => (
        <div key={day.day} className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-mono text-brand-gold uppercase block mb-1">{day.title}</span>
          <span className="text-white/60 text-[11px]">
            {(day.items || []).slice(0, 2).map((item) => item.activity).join(' • ')}
          </span>
        </div>
      ))}

      <div className="pt-2 mt-auto flex items-center justify-between gap-3 border-t border-white/10">
        <span className="text-[10px] font-mono text-white/30">
          {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recently shared'}
        </span>
        <Link
          to={shareUrl}
          className="px-5 py-2.5 rounded-full bg-brand-gold text-black font-bold text-[11px] uppercase tracking-widest hover:bg-white transition-colors"
        >
          View Itinerary →
        </Link>
      </div>
    </motion.div>
  );
}

export default function TripsGalleryPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    PlannerService.fetchPublicTrips()
      .then((publicTrips) => {
        if (!cancelled) setTrips(publicTrips);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 border-b border-white/10 pb-10">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block">
            Community Itineraries
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white">
            Traveler <span className="text-brand-gold italic">Trips Gallery</span>
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Real itineraries shared by the Horizon community. Get inspired, borrow an idea, or
            publish your own journey from your Trips page.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/plan-trip"
              className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              + Create Your Trip
            </Link>
            <Link
              to="/my-trips"
              className="px-6 py-2.5 rounded-full bg-white/10 text-white border border-white/15 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              My Trips
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-white/50 mt-3 uppercase tracking-widest">Loading community trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="py-20 text-center bg-[#121214] border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-4xl block">🧳</span>
            <h3 className="font-serif text-2xl text-white">No Published Trips Yet</h3>
            <p className="text-white/60 text-xs max-w-md mx-auto">
              Be the first! Design a trip with the Smart Planner, sync it to your account, and hit
              "Publish to Gallery" to share it with the community.
            </p>
            <Link
              to="/plan-trip"
              className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              Start Trip Planner Wizard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, idx) => (
              <PublicTripCard key={trip._id || idx} trip={trip} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
