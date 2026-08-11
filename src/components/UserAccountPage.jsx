import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function UserAccountPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'trips' | 'saved'

  useEffect(() => {

    const email = localStorage.getItem('horizon_user_email');
    const token = localStorage.getItem('horizon_token');
    if (email || token) {
      setUser({ email: email || 'Traveler' });
    }
  }, []);

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Profile Summary */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 border border-brand-gold text-brand-gold font-serif italic text-2xl flex items-center justify-center">
              {user ? user.email[0].toUpperCase() : 'HT'}
            </div>
            <div>
              <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">Verified Member</span>
              <h2 className="font-serif text-3xl text-white">{user ? user.email : 'Guest Member'}</h2>
              <p className="text-white/50 text-xs font-mono">Currency Standard: INR (₹)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/plan-trip"
              className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              + Plan New Trip
            </Link>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          {[
            { id: 'bookings', label: 'My Bookings' },
            { id: 'trips', label: 'Saved Trip Plans' },
            { id: 'saved', label: 'Saved Sanctuaries (Favorites)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-white">Your Bookings & Boarding Passes</h3>
            <div className="p-8 rounded-3xl bg-[#121214] border border-white/10 space-y-4">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-brand-gold uppercase">REF: TRV-2026-A82K9P</span>
                  <h4 className="font-serif text-2xl text-white">Goa Beach & Luxury Villa Retreat</h4>
                  <p className="text-xs font-mono text-white/50">Travelers: 2 Guests • Status: <strong className="text-green-400">CONFIRMED</strong></p>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-mono">
                  PAID (₹35,000)
                </span>
              </div>
              <p className="text-xs text-white/70">
                Boarding pass active. Chauffeur pickup scheduled from Manohar International Airport (MOPA).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="text-center py-10">
            <Link to="/my-trips" className="px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest">
              View All Saved Trip Plans →
            </Link>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-10">
            <Link to="/favorites" className="px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest">
              View Saved Favorites Page →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
