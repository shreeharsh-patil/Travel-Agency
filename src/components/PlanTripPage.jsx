import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { PlannerService } from '../services/trips/plannerService';
import { formatINR } from '../services/currency/currencyService';

export default function PlanTripPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [wizardData, setWizardData] = useState({
    destination: 'goa',
    durationDays: 3,
    travelers: '2 Guests',
    budgetINR: 50000,
    travelStyle: 'Luxury',
    interests: ['Beach', 'Culture'],
    accommodation: 'VIP Luxury Villa',
    activities: 'Private Catamaran',
    transportation: 'Chauffeur SUV',
    notes: ''
  });

  const [generating, setGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  const handleNext = () => {
    if (step < 10) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerateItinerary = async () => {
    setGenerating(true);
    try {
      const result = await PlannerService.generateItinerary(wizardData);
      setGeneratedItinerary(result);
      setStep(11); // View generated itinerary
    } catch (err) {
      console.error('Generate itinerary error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToAccount = () => {
    if (!generatedItinerary) return;
    const saved = PlannerService.saveItineraryToAccount(generatedItinerary);
    if (saved) {
      alert('Trip plan saved successfully to your account!');
      navigate('/my-trips');
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#0c0c0c] pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.3em]">
            Smart Travel Planner
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white">
            Design Your <span className="text-brand-gold italic">Bespoke Itinerary</span>
          </h1>
          <p className="text-white/60 text-sm max-w-lg mx-auto">
            Answer a few quick questions to generate a grounded, real-place trip plan tailored to your budget and style.
          </p>
        </div>

        {/* Wizard Stepper Progress */}
        {step <= 10 && (
          <div className="bg-[#121214] border border-white/10 rounded-full p-4 flex items-center justify-between overflow-x-auto">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-widest px-4">
              Step {step} of 10
            </span>
            <div className="flex-1 mx-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold transition-all duration-500"
                style={{ width: `${(step / 10) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Card Content */}
        <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">1. Select Destination</h3>
                <p className="text-white/60 text-xs font-mono">Where would you like to travel?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'goa', label: 'Goa (India)' },
                    { key: 'taj-mahal', label: 'Taj Mahal (Agra)' },
                    { key: 'jaipur', label: 'Jaipur (Rajasthan)' },
                    { key: 'kerala', label: 'Kerala Backwaters' },
                    { key: 'kyoto', label: 'Kyoto (Japan)' },
                    { key: 'amalfi', label: 'Amalfi Coast (Italy)' },
                    { key: 'paris', label: 'Paris (France)' },
                    { key: 'aspen', label: 'Aspen (USA)' },
                    { key: 'bali', label: 'Bali (Indonesia)' }
                  ].map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setWizardData({ ...wizardData, destination: d.key })}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold font-sans transition-all ${
                        wizardData.destination === d.key
                          ? 'bg-brand-gold text-black border-brand-gold shadow-lg shadow-brand-gold/20'
                          : 'bg-white/5 text-white/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">2. Trip Duration</h3>
                <p className="text-white/60 text-xs font-mono">How many days will your journey last?</p>
                <div className="flex items-center justify-center gap-6 py-6">
                  <button
                    onClick={() => setWizardData({ ...wizardData, durationDays: Math.max(1, wizardData.durationDays - 1) })}
                    className="w-12 h-12 rounded-full border border-white/20 text-white font-mono text-xl"
                  >
                    -
                  </button>
                  <span className="font-serif text-4xl text-brand-gold font-bold">{wizardData.durationDays} Days</span>
                  <button
                    onClick={() => setWizardData({ ...wizardData, durationDays: Math.min(14, wizardData.durationDays + 1) })}
                    className="w-12 h-12 rounded-full border border-white/20 text-white font-mono text-xl"
                  >
                    +
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">3. Travel Party</h3>
                <p className="text-white/60 text-xs font-mono">Who is accompanying you on this journey?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Solo Traveler (1 Guest)', 'Couple / Pair (2 Guests)', 'Small Group (3-4 Guests)', 'Family / Entourage (5+ Guests)'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setWizardData({ ...wizardData, travelers: g })}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                        wizardData.travelers === g
                          ? 'bg-brand-gold text-black border-brand-gold'
                          : 'bg-white/5 text-white/80 border-white/10'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">4. Estimated Budget (INR ₹)</h3>
                <p className="text-white/60 text-xs font-mono">What is your total target budget in Indian Rupees?</p>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="15000"
                    max="500000"
                    step="5000"
                    value={wizardData.budgetINR}
                    onChange={(e) => setWizardData({ ...wizardData, budgetINR: parseInt(e.target.value, 10) })}
                    className="w-full accent-brand-gold"
                  />
                  <div className="text-center font-mono text-3xl text-brand-gold font-bold">
                    {formatINR(wizardData.budgetINR)}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">5. Travel Style</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Luxury', 'Adventure', 'Cultural', 'Wellness', 'Family', 'Honeymoon'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setWizardData({ ...wizardData, travelStyle: style })}
                      className={`p-4 rounded-2xl border text-xs font-bold transition-all ${
                        wizardData.travelStyle === style
                          ? 'bg-brand-gold text-black border-brand-gold'
                          : 'bg-white/5 text-white/80 border-white/10'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">6. Primary Interests</h3>
                <p className="text-white/60 text-xs font-mono">Select your favorite experiences:</p>
                <div className="flex flex-wrap gap-3">
                  {['Beach', 'Temples', 'Water Sports', 'Fine Dining', 'Nature Walks', 'Hot Springs', 'Nightlife', 'Museums'].map((interest) => {
                    const isSel = wizardData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => {
                          const updated = isSel
                            ? wizardData.interests.filter(i => i !== interest)
                            : [...wizardData.interests, interest];
                          setWizardData({ ...wizardData, interests: updated });
                        }}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                          isSel
                            ? 'bg-brand-gold text-black'
                            : 'bg-white/5 text-white/70 border border-white/10'
                        }`}
                      >
                        {isSel ? '✓ ' : '+ '}{interest}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">7. Accommodation Preference</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['VIP Luxury Villa', 'Royal Heritage Palace', 'Boutique Beach Resort', 'Rainforest Lodge'].map((acc) => (
                    <button
                      key={acc}
                      onClick={() => setWizardData({ ...wizardData, accommodation: acc })}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                        wizardData.accommodation === acc ? 'bg-brand-gold text-black border-brand-gold' : 'bg-white/5 text-white/80 border-white/10'
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 8 && (
              <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">8. Signature Activity Preference</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Sunset Catamaran Cruise', 'Private Tea Ceremony', 'Helicopter Scenic Flight', 'Spa & Wellness Treatment'].map((act) => (
                    <button
                      key={act}
                      onClick={() => setWizardData({ ...wizardData, activities: act })}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                        wizardData.activities === act ? 'bg-brand-gold text-black border-brand-gold' : 'bg-white/5 text-white/80 border-white/10'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 9 && (
              <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">9. Preferred Ground Transportation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Private Chauffeur SUV', 'Luxury Airport Shuttle', 'High-Speed Bullet Train / Express', 'Self-Drive SUV'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setWizardData({ ...wizardData, transportation: t })}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                        wizardData.transportation === t ? 'bg-brand-gold text-black border-brand-gold' : 'bg-white/5 text-white/80 border-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 10 && (
              <motion.div key="step10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="font-serif text-2xl text-white">10. Special Requests & Preferences</h3>
                <textarea
                  rows="4"
                  value={wizardData.notes}
                  onChange={(e) => setWizardData({ ...wizardData, notes: e.target.value })}
                  placeholder="Dietary requirements, anniversary celebrations, preferred arrival times..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-brand-gold focus:outline-none"
                />
              </motion.div>
            )}

            {/* Step 11: Generated Grounded Itinerary Result */}
            {step === 11 && generatedItinerary && (
              <motion.div key="step11" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="text-center border-b border-white/10 pb-6">
                  <span className="text-xs font-mono text-brand-gold uppercase tracking-widest">
                    Grounded Real-Place Itinerary
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-white mt-1">
                    {generatedItinerary.durationDays}-Day Escape to {generatedItinerary.destination}
                  </h2>
                  <p className="text-white/60 text-xs mt-1">
                    Estimated Budget: <strong className="text-brand-gold">{generatedItinerary.formattedBudget}</strong> • {generatedItinerary.travelers}
                  </p>
                </div>

                <div className="space-y-6">
                  {generatedItinerary.itineraryDays.map((day) => (
                    <div key={day.day} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="font-serif text-xl text-brand-gold">{day.title}</h4>
                      <div className="space-y-3">
                        {day.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-4 text-xs">
                            <span className="font-mono text-white/50 w-16 pt-0.5">{item.time}</span>
                            <div className="flex-1">
                              <span className="text-white font-semibold block">{item.activity}</span>
                              <span className="text-white/40 text-[10px] font-mono">📍 {item.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={handleSaveToAccount}
                    className="flex-1 py-3.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Save Itinerary to My Trips ✨
                  </button>
                  <Link
                    to={`/places/${generatedItinerary.destination.toLowerCase()}`}
                    className="flex-1 py-3.5 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-widest text-center hover:bg-white/20 transition-colors"
                  >
                    View Destination Details →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Controls */}
          {step <= 10 && (
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-full bg-white/5 text-white/80 border border-white/10 text-xs uppercase tracking-wider font-semibold hover:bg-white/10"
                >
                  ← Back
                </button>
              ) : <div />}

              {step < 10 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleGenerateItinerary}
                  disabled={generating}
                  className="px-8 py-3.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  {generating ? 'Generating Itinerary...' : 'Generate Itinerary ✨'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
