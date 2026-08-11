import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const INTEREST_OPTIONS = ['Beach', 'Culture', 'Adventure', 'Wellness', 'Luxury', 'Food & Wine', 'Safari', 'Ski'];
const STYLE_OPTIONS = ['Luxury', 'Adventure', 'Cultural', 'Wellness', 'Family', 'Honeymoon'];
const BUDGET_OPTIONS = [
  { value: 25000, label: '₹25k — Essence' },
  { value: 75000, label: '₹75k — Refined' },
  { value: 150000, label: '₹1.5L — Prestige' },
  { value: 400000, label: '₹4L+ — Imperial' }
];

export default function UserAccountPage() {
  const [user, setUser] = useState(null);
  const [serverTripCount, setServerTripCount] = useState(0);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'trips' | 'saved' | 'profile'
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    interests: [],
    travelStyle: 'Luxury',
    budgetINR: 75000
  });

  useEffect(() => {
    loadProfile();
    loadServerTripCount();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('horizon_token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUser(u);
        setProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          avatar: u.avatar || '',
          interests: Array.isArray(u.preferences?.interests) ? u.preferences.interests : [],
          travelStyle: u.preferences?.travelStyle || 'Luxury',
          budgetINR: u.preferences?.budgetINR || 75000
        });
      }
    } catch (err) {
      console.error('Load profile error:', err);
    }
  };

  const loadServerTripCount = async () => {
    const token = localStorage.getItem('horizon_token');
    if (!token) return;
    try {
      const res = await fetch('/api/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setServerTripCount((data.trips || []).length);
      }
    } catch (err) {
      console.error('Load trips count error:', err);
    }
  };

  const toggleInterest = (interest) => {
    setProfileForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);

    const token = localStorage.getItem('horizon_token');
    if (!token) {
      setSaveMsg({ type: 'error', text: 'Please sign in to save your profile.' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          avatar: profileForm.avatar,
          preferences: {
            interests: profileForm.interests,
            travelStyle: profileForm.travelStyle,
            budgetINR: profileForm.budgetINR
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, ...data.user }));
        setSaveMsg({ type: 'success', text: '✓ Profile updated successfully.' });
      } else {
        setSaveMsg({ type: 'error', text: data.error || 'Could not save profile.' });
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setSaveMsg({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3500);
    }
  };

  const displayName = user?.name || user?.email || 'Guest Member';
  const initial = displayName[0].toUpperCase();

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Profile Summary */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 border border-brand-gold flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif italic text-2xl text-brand-gold">{initial}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest block">
                {user ? 'Verified Member' : 'Guest Member'}
              </span>
              <h2 className="font-serif text-3xl text-white">{displayName}</h2>
              {user?.phone && <p className="text-white/40 text-xs font-mono">📞 {user.phone}</p>}
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
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
          {[
            { id: 'bookings', label: 'My Bookings' },
            { id: 'trips', label: `Trip Plans (${serverTripCount})` },
            { id: 'saved', label: 'Saved Sanctuaries' },
            { id: 'profile', label: 'Profile & Preferences' }
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
          <div className="text-center py-10 bg-[#121214] border border-white/10 rounded-3xl space-y-4">
            <span className="text-4xl block">🧳</span>
            <h3 className="font-serif text-2xl text-white">
              {serverTripCount > 0 ? `${serverTripCount} Trip${serverTripCount > 1 ? 's' : ''} synced to your account` : 'Trip Plans'}
            </h3>
            <p className="text-white/60 text-xs max-w-md mx-auto">
              View, share, or delete every itinerary you've designed — synced across devices when signed in.
            </p>
            <Link to="/my-trips" className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest">
              Open My Trips →
            </Link>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-10 bg-[#121214] border border-white/10 rounded-3xl space-y-4">
            <span className="text-4xl block">♥</span>
            <h3 className="font-serif text-2xl text-white">Saved Sanctuaries</h3>
            <p className="text-white/60 text-xs max-w-md mx-auto">
              Your favorite destinations live on the Favorites page.
            </p>
            <Link to="/favorites" className="inline-block px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest">
              View Saved Favorites →
            </Link>
          </div>
        )}

        {/* PROFILE EDITOR TAB */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl"
          >
            <div>
              <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">Traveler Profile</span>
              <h3 className="font-serif text-3xl text-white mt-1">Personal Details & Preferences</h3>
              <p className="text-white/50 text-xs mt-2 max-w-lg">
                Tell us how you like to travel — we'll use this to tailor packages, itineraries, and concierge recommendations.
              </p>
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-xl text-xs text-center font-mono border ${
                saveMsg.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {saveMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-white/60">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your preferred name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-white/60">Phone (for concierge)</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase font-mono text-white/60">Avatar Image URL</label>
                  <input
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://... (optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase font-mono text-white/60 block">Travel Interests</label>
                <div className="flex flex-wrap gap-2.5">
                  {INTEREST_OPTIONS.map((interest) => {
                    const active = profileForm.interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          active
                            ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                            : 'bg-white/5 text-white/70 border border-white/10 hover:border-white/25'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-white/60 block">Travel Style</label>
                  <select
                    value={profileForm.travelStyle}
                    onChange={(e) => setProfileForm({ ...profileForm, travelStyle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold focus:outline-none"
                  >
                    {STYLE_OPTIONS.map((style) => (
                      <option key={style} value={style} className="bg-[#121214]">{style}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-white/60 block">Typical Budget / Trip</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGET_OPTIONS.map((b) => (
                      <button
                        type="button"
                        key={b.value}
                        onClick={() => setProfileForm({ ...profileForm, budgetINR: b.value })}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          profileForm.budgetINR === b.value
                            ? 'bg-brand-gold text-black'
                            : 'bg-white/5 text-white/70 border border-white/10'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile ✨'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  );
}
