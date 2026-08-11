import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { PlannerService } from '../services/trips/plannerService';

function TripCard({ trip, onDelete, _onShare, shared = false }) {

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!trip.shareId) return;
    const url = `${window.location.origin}/my-trips?share=${trip.shareId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trip.durationDays}-Day Escape to ${trip.destination}`,
          text: 'Plan your journey with Horizon Travels ✈️',
          url
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy link error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-white/10 pb-4 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">
              {trip.durationDays} Days • {trip.destination}
            </span>
            {trip.synced && (
              <span className="text-[9px] font-mono text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
                ☁ SYNCED
              </span>
            )}
            {trip.shareId && (
              <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                {trip.shareId}
              </span>
            )}
          </div>
          <h3 className="font-serif text-3xl text-white mt-1">
            {trip.durationDays}-Day Escape to {trip.destination}
          </h3>
          <p className="text-white/50 text-xs font-mono mt-1">
            Budget: {trip.formattedBudget} • Party: {trip.travelers}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {trip.shareId && (
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-mono hover:bg-white hover:text-black transition-colors"
            >
              {copied ? '✓ Link Copied!' : '⇱ Share'}
            </button>
          )}
          {!shared && (
            <button
              onClick={() => onDelete(trip)}
              className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono hover:bg-red-500 hover:text-white transition-colors"
            >
              Delete Trip
            </button>
          )}
        </div>
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

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        {shared && (
          <button
            onClick={handleShare}
            className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-mono border border-white/15 hover:bg-white hover:text-black transition-colors"
          >
            Copy Share Link
          </button>
        )}
        <Link
          to={`/places/${String(trip.destination || '').toLowerCase()}`}
          className="px-6 py-2.5 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
        >
          Explore {trip.destination} Sanctuaries →
        </Link>
      </div>
    </motion.div>
  );
}

export default function MyTripsPage() {
  const [searchParams] = useSearchParams();
  const shareId = searchParams.get('share');

  const [savedTrips, setSavedTrips] = useState([]);
  const [sharedTrip, setSharedTrip] = useState(null);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSavedTrips = useCallback(async () => {
    setLoading(true);
    try {
      const local = PlannerService.getMySavedTrips();
      const server = await PlannerService.fetchServerTrips();

      // Enrich local trips that are already on the server with share/sync info.
      const serverByLocal = new Map(server.map((s) => [s._id, s]));
      const enrichedLocal = local.map((t) => {
        const match = serverByLocal.get(t.serverId);
        if (match) {
          return { ...t, shareId: match.shareId, synced: true };
        }
        return t;
      });

      // Server-only trips (synced from another device) get prepended.
      const localKeys = new Set(enrichedLocal.map((t) => t.serverId || t.id));
      const serverOnly = server
        .filter((s) => !localKeys.has(s._id))
        .map((s) => ({ ...s, id: s._id, synced: true, serverOnly: true }));

      setSavedTrips([...serverOnly, ...enrichedLocal]);
    } catch (err) {
      console.error('Load trips error:', err);
      setSavedTrips(PlannerService.getMySavedTrips());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shareId) {
      loadSharedTrip(shareId);
    } else {
      loadSavedTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  const loadSharedTrip = async (id) => {
    setSharedLoading(true);
    setSharedError(null);
    const trip = await PlannerService.getSharedTrip(id);
    if (trip) {
      setSharedTrip(trip);
    } else {
      setSharedError('This shared trip could not be found. It may have been deleted.');
    }
    setSharedLoading(false);
  };

  const deleteTrip = async (trip) => {
    if (!window.confirm('Delete this trip? This will remove it from your account too.')) return;
    await PlannerService.deleteTrip(trip.id, trip.serverId || trip._id);
    loadSavedTrips();
  };

  // --- Shared trip read-only view ---
  if (shareId) {
    return (
      <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block mb-1">
                Shared Itinerary
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl text-white">A Journey to {sharedTrip?.destination || '...'}</h1>
            </div>
            <Link
              to="/my-trips"
              className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              ← Back to My Trips
            </Link>
          </div>

          {sharedLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-white/50 mt-3 uppercase tracking-widest">Loading shared trip...</p>
            </div>
          ) : sharedError ? (
            <div className="py-20 text-center bg-[#121214] border border-white/10 rounded-3xl space-y-4">
              <span className="text-4xl block">🧭</span>
              <h3 className="font-serif text-2xl text-white">Trip Not Found</h3>
              <p className="text-white/60 text-xs max-w-sm mx-auto">{sharedError}</p>
              <Link to="/my-trips" className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest">
                View My Trips
              </Link>
            </div>
          ) : (
            <TripCard trip={sharedTrip} onDelete={() => {}} shared />
          )}
        </div>
      </section>
    );
  }

  // --- Normal My Trips view ---
  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em] block mb-1">
              Personal Journeys
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-white">My Trips & Itineraries</h1>
            <p className="text-white/50 text-xs mt-2 font-mono">
              Sign in to sync trips across devices and share them with anyone via a link.
            </p>
          </div>
          <Link
            to="/plan-trip"
            className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors text-center"
          >
            + Create New Trip Plan
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-white/50 mt-3 uppercase tracking-widest">Loading your journeys...</p>
          </div>
        ) : savedTrips.length === 0 ? (
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
              <TripCard key={trip.id || trip._id} trip={trip} onDelete={deleteTrip} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
