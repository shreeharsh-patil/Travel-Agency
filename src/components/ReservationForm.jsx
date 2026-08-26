import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReservationForm({ destination, onClose }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        guests: '2 Guests',
        startDate: '',
        endDate: '',
        tier: 'VIP Luxury Villa',
        notes: '',
        addons: []
    });

    const displayInfo = destination || {
        name: "Bespoke World Journey",
        title: "Bespoke World Journey",
        priceFrom: 125000,
        image: "/images/tropical_beach.png",
        location: "Global Sanctuary"
    };

    const basePrice = displayInfo.priceFrom || 125000;

    const availableAddons = [
        { id: 'jet', name: 'Private Jet Flight Transfer', price: 45000, icon: '✈️', desc: 'Direct luxury charter flight to destination' },
        { id: 'chef', name: 'Private Chef & Butler Service', price: 18000, icon: '👨‍🍳', desc: '24/7 dedicated culinary team' },
        { id: 'yacht', name: 'Sunset Yacht Charter', price: 24000, icon: '🛥️', desc: 'Full-day private catamaran sailing' },
        { id: 'spa', name: 'Unlimited Wellness Spa Pass', price: 9500, icon: '🧘', desc: 'Holistic treatments and thermal baths' }
    ];

    const calculatedAddonsTotal = formData.addons.reduce((acc, addonId) => {
        const item = availableAddons.find(a => a.id === addonId);
        return acc + (item ? item.price : 0);
    }, 0);

    const calculatedNights = useMemo(() => {
        if (!formData.startDate || !formData.endDate) return 1;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    }, [formData.startDate, formData.endDate]);

    const totalEstimate = Math.round(basePrice * calculatedNights * (formData.tier === 'Ultra VIP Estate' ? 1.4 : 1) + calculatedAddonsTotal);

    const toggleAddon = (id) => {
        setFormData(prev => ({
            ...prev,
            addons: prev.addons.includes(id)
                ? prev.addons.filter(a => a !== id)
                : [...prev.addons, id]
        }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const [bookingReference] = useState(() => `HZ-${Math.floor(100000 + Math.random() * 900000)}`);
    const [submitState, setSubmitState] = useState('idle'); // idle | submitting | error | done
    const [submitError, setSubmitError] = useState('');

    const handleCompleteBooking = async () => {
        setSubmitState('submitting');
        setSubmitError('');
        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    guests: formData.guests,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    nights: calculatedNights,
                    tier: formData.tier,
                    notes: formData.notes,
                    addons: formData.addons,
                    destination: displayInfo.title || displayInfo.name,
                    destinationLocation: displayInfo.location || null,
                    totalEstimate,
                    bookingReference
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Could not save your reservation.');
            }
            setSubmitState('done');
            setStep(4);
        } catch (err) {
            setSubmitState('error');
            setSubmitError(err.message);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                className="relative w-full max-w-2xl bg-[#111113] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black transition-colors"
                    aria-label="Close modal"
                >
                    ✕
                </button>

                {/* Hero Header */}
                <div className="h-44 w-full relative">
                    <img
                        src={displayInfo.image}
                        alt={displayInfo.title || displayInfo.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/40 to-transparent" />
                    
                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-gold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-brand-gold/30">
                                {displayInfo.location || 'Luxury Experience'}
                            </span>
                            <h3 className="font-serif text-3xl text-white mt-1">{displayInfo.title || displayInfo.name}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-white/50 uppercase tracking-widest block">Est. Package</span>
                            <span className="font-mono text-xl text-brand-gold font-bold">₹{totalEstimate.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Stepper Indicator */}
                <div className="px-8 pt-4 flex items-center justify-between border-b border-white/10 pb-4">
                    {['Package & Dates', 'Bespoke Add-ons', 'Guest Details', 'Travel Pass'].map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = step === stepNum;
                        const isDone = step > stepNum;

                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                                        isDone
                                            ? 'bg-brand-gold text-black'
                                            : isActive
                                            ? 'bg-white text-black ring-4 ring-white/10'
                                            : 'bg-white/10 text-white/40'
                                    }`}
                                >
                                    {isDone ? '✓' : stepNum}
                                </div>
                                <span className={`hidden sm:inline text-xs font-sans tracking-wider ${isActive ? 'text-white font-semibold' : 'text-white/40'}`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Form Content */}
                <div className="p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <h4 className="font-serif text-xl text-white">1. Choose Accommodations & Schedule</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">Travel Party</label>
                                        <select
                                            value={formData.guests}
                                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                        >
                                            <option value="1 Guest" className="bg-neutral-900">Solo Traveler (1 Guest)</option>
                                            <option value="2 Guests" className="bg-neutral-900">Couple / Pair (2 Guests)</option>
                                            <option value="3-4 Guests" className="bg-neutral-900">Small Group (3-4 Guests)</option>
                                            <option value="5+ Guests" className="bg-neutral-900">Family / Entourage (5+ Guests)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">Check-in Date *</label>
                                        <input
                                            type="date"
                                            min={todayStr}
                                            value={formData.startDate}
                                            onChange={(e) => {
                                                const newStart = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    startDate: newStart,
                                                    endDate: prev.endDate && prev.endDate <= newStart ? '' : prev.endDate
                                                }));
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:border-brand-gold transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">Checkout Date *</label>
                                        <input
                                            type="date"
                                            min={formData.startDate || todayStr}
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 focus:outline-none focus:border-brand-gold transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {formData.startDate && formData.endDate && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                                        <span className="text-white/60">Stay Duration:</span>
                                        <span className="text-brand-gold font-bold">{calculatedNights} {calculatedNights === 1 ? 'Night' : 'Nights'}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-white/60">Accommodation Category</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { name: 'VIP Luxury Villa', desc: 'Private suite, infinity pool & ocean views' },
                                            { name: 'Ultra VIP Estate', desc: 'Helipad access, personal beach & security' }
                                        ].map(t => (
                                            <button
                                                type="button"
                                                key={t.name}
                                                onClick={() => setFormData({ ...formData, tier: t.name })}
                                                className={`p-4 rounded-xl text-left border transition-all ${
                                                    formData.tier === t.name
                                                        ? 'border-brand-gold bg-brand-gold/10 text-white'
                                                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm text-white">{t.name}</div>
                                                <div className="text-xs text-white/50 mt-1">{t.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h4 className="font-serif text-xl text-white">2. Enhance Your Experience</h4>
                                <p className="text-white/60 text-xs font-sans">Select optional VIP add-ons to customize your journey.</p>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {availableAddons.map(addon => {
                                        const isSelected = formData.addons.includes(addon.id);
                                        return (
                                            <div
                                                key={addon.id}
                                                onClick={() => toggleAddon(addon.id)}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                                    isSelected
                                                        ? 'border-brand-gold bg-brand-gold/10 text-white'
                                                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{addon.icon}</span>
                                                    <div>
                                                        <div className="font-semibold text-sm text-white">{addon.name}</div>
                                                        <div className="text-xs text-white/50">{addon.desc}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-sm text-brand-gold">+₹{addon.price.toLocaleString('en-IN')}</span>
                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${
                                                        isSelected ? 'bg-brand-gold border-brand-gold text-black' : 'border-white/20'
                                                    }`}>
                                                        {isSelected ? '✓' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h4 className="font-serif text-xl text-white">3. Primary Traveler Details</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">First Name *</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                            placeholder="Alexander"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">Last Name *</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                            placeholder="Vane"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">Email Address *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                            placeholder="alexander@horizon.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/60">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-white/60">Bespoke Requests & Dietary Requirements</label>
                                    <textarea
                                        rows="2"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors text-sm"
                                        placeholder="E.g., Private champagne welcome, allergy preferences..."
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-brand-gold/20 border border-brand-gold text-brand-gold flex items-center justify-center mx-auto text-3xl">
                                    ✓
                                </div>

                                <div>
                                    <span className="font-mono text-xs text-brand-gold uppercase tracking-widest">Reservation Confirmed</span>
                                    <h4 className="font-serif text-3xl text-white mt-1">Your Journey Begins</h4>
                                    <p className="text-white/60 text-xs mt-1">Ref Code: <span className="font-mono text-white font-bold">{bookingReference}</span></p>
                                </div>

                                {/* VIP Boarding Pass Card */}
                                <div className="bg-black/60 border border-brand-gold/40 rounded-2xl p-6 text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl" />
                                    
                                    <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-mono text-brand-gold">HORIZON TRAVELS • VIP PASS</span>
                                            <h5 className="font-serif text-xl text-white">{displayInfo.title || displayInfo.name}</h5>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase text-white/40 block">Guest</span>
                                            <span className="text-sm font-semibold text-white">{formData.firstName || 'Honored'} {formData.lastName || 'Guest'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <span className="text-white/40 block text-[10px] uppercase">Party</span>
                                            <span className="text-white font-medium">{formData.guests}</span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block text-[10px] uppercase">Tier</span>
                                            <span className="text-white font-medium">{formData.tier}</span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block text-[10px] uppercase">Total Value</span>
                                            <span className="text-brand-gold font-mono font-bold">₹{totalEstimate.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {formData.addons.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-white/10">
                                            <span className="text-[10px] uppercase text-white/40 block mb-1">Included Services:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.addons.map(id => {
                                                    const item = availableAddons.find(a => a.id === id);
                                                    return (
                                                        <span key={id} className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-white/90">
                                                            {item?.icon} {item?.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-white/50 text-xs italic">
                                    Your dedicated Lifestyle Concierge will contact <span className="text-white underline">{formData.email || 'you'}</span> within 2 hours with complete arrival details.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Navigation Bar */}
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                        {step > 1 && step < 4 ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs uppercase tracking-wider font-semibold transition-colors"
                            >
                                ← Back
                            </button>
                        ) : <div />}

                        {step < 3 && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-8 py-3 rounded-full bg-white text-black hover:bg-brand-gold hover:text-white font-sans text-xs uppercase tracking-widest font-bold transition-all"
                            >
                                Continue →
                            </button>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-end gap-2">
                                {submitState === 'error' && (
                                    <p className="text-red-400 text-xs font-sans text-right max-w-xs">
                                        {submitError}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={handleCompleteBooking}
                                    disabled={submitState === 'submitting'}
                                    className="px-8 py-3 rounded-full bg-brand-gold text-black hover:bg-white font-sans text-xs uppercase tracking-widest font-bold transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitState === 'submitting' ? 'Securing your reservation…' : 'Complete Booking ✨'}
                                </button>
                                {submitState === 'error' && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(4)}
                                        className="text-white/40 hover:text-white text-[11px] underline transition-colors"
                                    >
                                        Continue in demo mode (skip saving)
                                    </button>
                                )}
                            </div>
                        )}

                        {step === 4 && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3.5 rounded-full bg-brand-gold text-black hover:bg-white font-sans text-xs uppercase tracking-widest font-bold transition-all"
                            >
                                Done & View Itinerary
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
