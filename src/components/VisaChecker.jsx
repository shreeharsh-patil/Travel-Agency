import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interactive Visa & Entry Requirements Checker.
 * Estimates entry rules for a traveler's nationality going to the destination's country.
 * Always caveats that official sources should be checked before travel.
 */

const NATIONALITIES = [
  { code: 'India', flag: '🇮🇳' },
  { code: 'United States', flag: '🇺🇸' },
  { code: 'United Kingdom', flag: '🇬🇧' },
  { code: 'Germany', flag: '🇩🇪' },
  { code: 'France', flag: '🇫🇷' },
  { code: 'Italy', flag: '🇮🇹' },
  { code: 'Spain', flag: '🇪🇸' },
  { code: 'Netherlands', flag: '🇳🇱' },
  { code: 'Australia', flag: '🇦🇺' },
  { code: 'Canada', flag: '🇨🇦' },
  { code: 'Japan', flag: '🇯🇵' },
  { code: 'China', flag: '🇨🇳' },
  { code: 'UAE', flag: '🇦🇪' },
  { code: 'Singapore', flag: '🇸🇬' },
  { code: 'South Africa', flag: '🇿🇦' },
  { code: 'Brazil', flag: '🇧🇷' },
  { code: 'Mexico', flag: '🇲🇽' },
  { code: 'Thailand', flag: '🇹🇭' }
];

const SLUG_COUNTRY = {
  kyoto: 'Japan', tokyo: 'Japan', osaka: 'Japan',
  amalfi: 'Italy', rome: 'Italy', venice: 'Italy',
  paris: 'France', nice: 'France', swiss_alps: 'Switzerland', zermatt: 'Switzerland',
  bali: 'Indonesia', reykjavik: 'Iceland', dubai: 'UAE', singapore: 'Singapore',
  santorini: 'Greece', maldives: 'Maldives', thailand: 'Thailand'
};

const SCHENGEN = ['Italy', 'France', 'Germany', 'Spain', 'Netherlands', 'Switzerland', 'Iceland', 'Greece'];
const STRONG_PASSPORTS = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Japan', 'Singapore', 'UAE'];

const STATUS_META = {
  visa_free: { label: 'Visa-Free', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '🛂' },
  evisa: { label: 'eVisa / Online', color: 'bg-brand-gold/15 text-brand-gold border-brand-gold/40', icon: '📝' },
  visa_on_arrival: { label: 'Visa on Arrival', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30', icon: '🎫' },
  visa_required: { label: 'Visa Required', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '⚠️' },
  check: { label: 'Check Entry Rules', color: 'bg-white/10 text-white/70 border-white/20', icon: '🧭' }
};

function resolveRule(country, nationality) {
  const dest = country.trim().toLowerCase();

  if (dest.includes('india')) {
    if (nationality === 'India') {
      return { status: 'visa_free', note: 'Domestic travel for Indian citizens — no visa needed. Government-issued photo ID required for domestic flights.' };
    }
    return {
      status: 'evisa',
      note: 'Most nationalities qualify for the Indian eVisa (e-Tourist Visa) — 30/1-year/5-year options, apply online before arrival. Some nationalities may require a regular visa or are eligible for visa-free entry.',
      dest: 'India'
    };
  }

  if (dest.includes('japan')) {
    if (STRONG_PASSPORTS.includes(nationality)) {
      return { status: 'visa_free', note: 'Visa-free entry for tourism up to 90 days. Passport must be valid for the entire stay.' };
    }
    return { status: 'visa_required', note: 'A Japan visa is required. Indian & Chinese passport holders can apply for the Japan eVisa online through accredited agencies.' };
  }

  if (SCHENGEN.some((c) => dest.includes(c.toLowerCase()))) {
    if (STRONG_PASSPORTS.includes(nationality)) {
      return { status: 'visa_free', note: 'Visa-free within the Schengen Area for tourism up to 90 days in any 180-day period.' };
    }
    return {
      status: 'visa_required',
      note: 'A Schengen Visa (Type C) is required. Apply at the consulate of your first point of entry, up to 6 months before travel. Standard processing is ~15 days.'
    };
  }

  if (dest.includes('indonesia')) {
    if (nationality === 'India' || nationality === 'China') {
      return { status: 'visa_on_arrival', note: 'Visa on Arrival (VoA) available at major airports — ~IDR 500,000, valid 30 days, extendable once.' };
    }
    return { status: 'visa_free', note: 'Visa-free entry for tourism up to 30 days for most nationalities.' };
  }

  if (dest.includes('maldives')) {
    return { status: 'visa_on_arrival', note: 'Free visa on arrival for all nationalities, valid 30 days. Passport valid 6+ months.' };
  }

  if (dest.includes('thailand')) {
    if (nationality === 'India') {
      return { status: 'visa_on_arrival', note: 'Visa on Arrival for Indian passport holders — THB 2,000, valid 15 days (paid VOA counters at airports).' };
    }
    return { status: 'visa_free', note: 'Visa-free entry for tourism up to 30–60 days for most nationalities.' };
  }

  if (dest.includes('uae')) {
    if (nationality === 'India' || nationality === 'China') {
      return { status: 'visa_on_arrival', note: 'Visa on arrival for Indian & Chinese nationals with valid passports — 14 days, extendable.' };
    }
    return { status: 'visa_free', note: 'Visa-free or visa-on-arrival for most nationalities — check entry validity at time of booking.' };
  }

  // Unknown destination — fall back to the place's own travel-info note.
  return {
    status: 'check',
    note: 'Entry rules for this destination vary by nationality and time of year. Always confirm with the destination embassy or official immigration portal before booking.',
    dest: country
  };
}

export default function VisaChecker({ place }) {
  const [nationality, setNationality] = useState('India');

  const country = useMemo(() => {
    const placeCountry = String(place?.country || '').trim();
    const slug = String(place?.slug || place?.id || '').toLowerCase();
    return placeCountry || SLUG_COUNTRY[slug] || 'India';
  }, [place]);

  const result = useMemo(() => resolveRule(country, nationality), [country, nationality]);
  const meta = STATUS_META[result.status] || STATUS_META.check;
  const destVisaHint = place?.travelInfo?.visa;

  return (
    <div className="bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-5">
      <div>
        <span className="text-xs font-mono text-brand-gold uppercase tracking-widest block">🛂 Visa & Entry Checker</span>
        <h4 className="font-serif text-xl text-white mt-1">Travel to {place?.name || country}</h4>
        <p className="text-[10px] text-white/40 mt-1 font-mono">
          Destination: {country}
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-white/40 font-mono uppercase block text-[10px]">Your Nationality</span>
        <div className="relative">
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-gold focus:outline-none cursor-pointer"
          >
            {NATIONALITIES.map((n) => (
              <option key={n.code} value={n.code} className="bg-[#141417]">
                {n.flag} {n.code}
              </option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▾</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${country}-${nationality}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase block">Estimated Entry</span>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${meta.color}`}>
                {meta.icon} {meta.label}
              </span>
            </div>
            <span className="text-3xl">{NATIONALITIES.find((n) => n.code === nationality)?.flag || '🌍'}</span>
          </div>

          <p className="text-white/70 text-xs leading-relaxed">{result.note}</p>

          {destVisaHint && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Destination Requirement</span>
              <span className="text-white/80 text-[11px]">{destVisaHint}</span>
            </div>
          )}

          <p className="text-[10px] text-white/30 italic leading-relaxed">
            Estimates only — immigration rules change frequently. Verify with the official {country} immigration portal or your local embassy before booking.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
