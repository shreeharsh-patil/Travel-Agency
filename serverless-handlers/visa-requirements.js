/**
 * Free Visa & Passport Requirements Engine (Zero API Key Required).
 * Computes official entry protocols, e-Visa links, stay durations, and passport validity rules.
 */

const VISA_RULES = {
  // Destination: India
  'india': {
    'IN': { type: 'Domestic Citizen', badge: 'No Visa Required', stay: 'Unlimited', note: 'Domestic travel for Indian citizens. Valid government photo ID (Aadhaar / Passport / Voter ID) required for flights.' },
    'US': { type: 'e-Visa Required', badge: 'e-Tourist Visa', stay: '30 to 90 Days', note: 'Electronic Tourist Visa (eTV) available online with 72-hour processing. Passport must have 6+ months validity.' },
    'GB': { type: 'e-Visa Required', badge: 'e-Tourist Visa', stay: '30 to 90 Days', note: 'UK citizens are eligible for the 30-day and 1-year Indian e-Visa applied online prior to travel.' },
    'EU': { type: 'e-Visa Required', badge: 'e-Tourist Visa', stay: '30 to 90 Days', note: 'EU citizens can apply for an Indian e-Tourist Visa online with double/multiple entries.' },
    'DEFAULT': { type: 'e-Visa Eligible', badge: 'e-Tourist Visa', stay: '30 Days', note: 'Most nationalities can obtain an online Indian e-Visa before departure.' }
  },
  // Destination: Japan
  'japan': {
    'IN': { type: 'eVisa / Embassy Visa', badge: 'eVisa / Sticker Visa', stay: '15 to 90 Days', note: 'Indian passport holders can apply via official Japan eVisa portal or VFS for a single-entry tourist visa.' },
    'US': { type: 'Visa Free', badge: 'Visa-Free Entry', stay: '90 Days', note: 'US passport holders enjoy visa-free entry for tourism up to 90 days.' },
    'GB': { type: 'Visa Free', badge: 'Visa-Free Entry', stay: '90 Days', note: 'UK citizens can travel visa-free to Japan for up to 90 days.' },
    'EU': { type: 'Visa Free', badge: 'Visa-Free Entry', stay: '90 Days', note: 'EU citizens enjoy visa exemption for short-term tourist stays up to 90 days.' },
    'DEFAULT': { type: 'Visa Exempt or eVisa', badge: 'Check Eligibility', stay: '15 to 90 Days', note: 'Verify eVisa portal eligibility based on country of residence and passport type.' }
  },
  // Destination: Italy / France / Switzerland (Schengen)
  'italy': {
    'IN': { type: 'Schengen Visa Required', badge: 'Schengen Tourist Visa (Type C)', stay: 'Up to 90 Days', note: 'Requires Schengen Visa application at VFS / Italian Embassy with travel insurance and hotel reservations.' },
    'US': { type: 'Visa Free', badge: 'Visa-Free (ETIAS Ready)', stay: '90 Days in 180 Days', note: 'Visa-free for US citizens up to 90 days across the Schengen zone.' },
    'GB': { type: 'Visa Free', badge: 'Visa-Free (Schengen 90 Days)', stay: '90 Days in 180 Days', note: 'UK passport holders can visit Schengen countries visa-free for 90 days within any 180-day window.' },
    'EU': { type: 'EU Freedom of Movement', badge: 'ID Card / Passport', stay: 'Unlimited', note: 'Freedom of movement across EU / Schengen member states.' },
    'DEFAULT': { type: 'Schengen Protocol', badge: 'Schengen Visa', stay: '90 Days', note: 'Standard Schengen entry regulations apply.' }
  },
  // Destination: Indonesia / Bali
  'indonesia': {
    'IN': { type: 'Visa on Arrival (e-VOA)', badge: 'e-VOA on Arrival', stay: '30 Days (Extendable)', note: 'Indian travelers can apply online for e-VOA or pay IDR 500,000 (~$35) upon arrival at DPS airport.' },
    'US': { type: 'Visa on Arrival (e-VOA)', badge: 'e-VOA on Arrival', stay: '30 Days (Extendable)', note: 'Eligible for 30-day Visa on Arrival / e-VOA at all Indonesian international ports.' },
    'GB': { type: 'Visa on Arrival (e-VOA)', badge: 'e-VOA on Arrival', stay: '30 Days (Extendable)', note: 'Eligible for 30-day Visa on Arrival.' },
    'EU': { type: 'Visa on Arrival (e-VOA)', badge: 'e-VOA on Arrival', stay: '30 Days (Extendable)', note: 'Eligible for 30-day Visa on Arrival.' },
    'DEFAULT': { type: 'Visa on Arrival', badge: 'e-VOA Available', stay: '30 Days', note: 'Visa on Arrival available for 90+ nationalities.' }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'goa', passport = 'IN' } = req.query || {};
  const destClean = String(destination).toLowerCase().trim();
  const passClean = String(passport).toUpperCase().trim();

  let destMatch = VISA_RULES[destClean];
  if (!destMatch) {
    for (const [key, rules] of Object.entries(VISA_RULES)) {
      if (destClean.includes(key)) {
        destMatch = rules;
        break;
      }
    }
  }

  const info = destMatch ? (destMatch[passClean] || destMatch['DEFAULT']) : {
    type: 'Standard International Entry',
    badge: 'Passport Validity (6+ Months)',
    stay: '30 to 90 Days',
    note: 'Ensure passport has at least 6 months validity from departure date and 2 blank visa pages.'
  };

  return res.status(200).json({
    success: true,
    destination,
    passport: passClean,
    requirements: info,
    source: 'Free Worldwide Visa & Entry Requirements Engine'
  });
}
