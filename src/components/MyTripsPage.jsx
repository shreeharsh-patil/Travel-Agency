import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlannerService } from '../services/trips/plannerService';

export default function MyTripsPage() {
  const [savedTrips, setSavedTrips] = useState([]);

  const loadSavedTrips = () => {
    const trips = PlannerService.getMySavedTrips();
    setSavedTrips(trips);
  };

  useEffect(() => {
    loadSavedTrips();
  }, []);


  const deleteTrip = (id) => {
    try {
      const updated = savedTrips.filter(t => t.id !== id);
      localStorage.setItem('horizon_my_trips', JSON.stringify(updated));
      setSavedTrips(updated);
    } catch (err) {
      console.error('Delete trip error:', err);
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block mb-1">
              Personal Journeys
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">My Trips & Itineraries</h1>
          </div>
          <Link
            to="/plan-trip"
            className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors text-center"
          >
            + Create New Trip Plan
          </Link>
        </div>

        {savedTrips.length === 0 ? (
          <div className="py-20 text-center bg-[#121214] border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-4xl block">🧳</span>
            <h3 className="font-serif text-2xl text-white">No Saved Trip Plans Yet</h3>
            <p className="text-white/60 text-xs max-w-md mx-auto">
              Use our Smart Travel Planner wizard to design a grounded, real-place itinerary for your upcoming journey.
            </p>
            <Link
              to="/plan-trip"
              className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              Start Trip Planner Wizard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {savedTrips.map((trip) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-white/10 pb-4 gap-4">
                  <div>
                    <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">
                      {trip.durationDays} Days • {trip.destination}
                    </span>
                    <h3 className="font-serif text-3xl text-white mt-1">
                      {trip.durationDays}-Day Escape to {trip.destination}
                    </h3>
                    <p className="text-white/50 text-xs font-mono mt-1">
                      Budget: {trip.formattedBudget} • Party: {trip.travelers}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Delete Trip
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(trip.itineraryDays || []).map((day) => (
                    <div key={day.day} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <h4 className="font-serif text-lg text-brand-gold">{day.title}</h4>
                      <div className="space-y-2 text-xs">
                        {(day.items || []).map((item, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-1">
                            <span className="text-white font-medium block">{item.time} - {item.activity}</span>
                            <span className="text-white/40 text-[10px] font-mono">📍 {item.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Link
                    to={`/places/${trip.destination.toLowerCase()}`}
                    className="px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Explore {trip.destination} Sanctuaries →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
