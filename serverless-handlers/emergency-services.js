/**
 * Global Tourist Safety, Emergency Services & 24/7 Diplomatic Hotline API.
 * Provides destination-specific emergency dispatch numbers, medical trauma facilities, and VIP SOS routing.
 */

const EMERGENCY_DIRECTORIES = {
  india: {
    country: 'India',
    destinations: ['Goa', 'Jaipur', 'Udaipur', 'Kerala', 'Ladakh', 'Agra', 'Mumbai'],
    universalEmergencyNumber: '112',
    police: '100 / 112',
    ambulance: '102 / 108',
    fire: '101',
    touristPoliceHelpline: '1363 (24/7 Toll-Free, English & Multilingual)',
    womenHelpline: '1091',
    recommendedHospitals: [
      { name: 'Manipal Hospital & Apollo Clinic', city: 'Goa', englishSpeaking: true, traumaCare247: true },
      { name: 'Fortis Escorts Hospital', city: 'Jaipur', englishSpeaking: true, traumaCare247: true },
      { name: 'Aster Medcity', city: 'Kochi (Kerala)', englishSpeaking: true, traumaCare247: true }
    ]
  },
  italy: {
    country: 'Italy',
    destinations: ['Amalfi Coast', 'Rome', 'Florence', 'Venice', 'Milan'],
    universalEmergencyNumber: '112',
    police: '113 (Polizia di Stato) / 112 (Carabinieri)',
    ambulance: '118 (Pronto Soccorso)',
    fire: '115 (Vigili del Fuoco)',
    coastGuard: '1530 (Guardia Costiera - Maritime Emergency)',
    recommendedHospitals: [
      { name: 'Ospedale Costa d’Amalfi', city: 'Ravello/Castiglione', englishSpeaking: true, traumaCare247: true },
      { name: 'Policlinico Umberto I', city: 'Rome', englishSpeaking: true, traumaCare247: true }
    ]
  },
  japan: {
    country: 'Japan',
    destinations: ['Kyoto', 'Tokyo', 'Hakone', 'Osaka'],
    universalEmergencyNumber: '110 (Police) / 119 (Ambulance/Fire)',
    police: '110',
    ambulance: '119',
    fire: '119',
    japanTouristHelpline: '+81 50 3816 2720 (JNTO 24/7 English Assistance)',
    recommendedHospitals: [
      { name: 'Kyoto University Hospital International Clinic', city: 'Kyoto', englishSpeaking: true, traumaCare247: true },
      { name: 'St. Luke’s International Hospital', city: 'Tokyo', englishSpeaking: true, traumaCare247: true }
    ]
  },
  france: {
    country: 'France',
    destinations: ['Paris', 'French Riviera', 'Courchevel'],
    universalEmergencyNumber: '112',
    police: '17',
    ambulance: '15 (SAMU)',
    fire: '18 (Pompiers)',
    recommendedHospitals: [
      { name: 'The American Hospital of Paris (Neuilly)', city: 'Paris', englishSpeaking: true, traumaCare247: true },
      { name: 'Hôpital Pasteur', city: 'Nice / French Riviera', englishSpeaking: true, traumaCare247: true }
    ]
  },
  usa: {
    country: 'United States',
    destinations: ['Aspen', 'New York', 'Miami', 'Colorado'],
    universalEmergencyNumber: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    recommendedHospitals: [
      { name: 'Aspen Valley Hospital (Level III Trauma)', city: 'Aspen, CO', englishSpeaking: true, traumaCare247: true },
      { name: 'Mount Sinai Hospital', city: 'New York', englishSpeaking: true, traumaCare247: true }
    ]
  },
  indonesia: {
    country: 'Indonesia',
    destinations: ['Bali', 'Ubud', 'Seminyak'],
    universalEmergencyNumber: '112',
    police: '110',
    ambulance: '118 / 119',
    fire: '113',
    touristPoliceBali: '+62 361 754 599',
    recommendedHospitals: [
      { name: 'BIMC Hospital Nusa Dua / Ubud International', city: 'Bali', englishSpeaking: true, traumaCare247: true },
      { name: 'Silom Hospitals Denpasar', city: 'Bali', englishSpeaking: true, traumaCare247: true }
    ]
  },
  iceland: {
    country: 'Iceland',
    destinations: ['Reykjavik', 'Thingvellir', 'Vík'],
    universalEmergencyNumber: '112',
    police: '112',
    ambulance: '112',
    fire: '112',
    safeTravelIceland: '112.is (Live weather & volcanic road hazard monitoring)',
    recommendedHospitals: [
      { name: 'Landspítali National University Hospital', city: 'Reykjavik', englishSpeaking: true, traumaCare247: true }
    ]
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { country = 'india' } = req.query || {};
  const clean = String(country).toLowerCase().trim();

  let data = EMERGENCY_DIRECTORIES[clean];
  if (!data) {
    for (const [key, val] of Object.entries(EMERGENCY_DIRECTORIES)) {
      if (val.destinations.some((d) => d.toLowerCase().includes(clean)) || val.country.toLowerCase().includes(clean)) {
        data = val;
        break;
      }
    }
  }

  if (!data) {
    data = EMERGENCY_DIRECTORIES.india;
  }

  return res.status(200).json({
    success: true,
    country: data.country,
    universalEmergencyNumber: data.universalEmergencyNumber,
    police: data.police,
    ambulance: data.ambulance,
    fire: data.fire,
    specializedHotlines: {
      touristPolice: data.touristPoliceHelpline || data.touristPoliceBali || null,
      coastGuard: data.coastGuard || null,
      safeTravelMonitoring: data.safeTravelIceland || null
    },
    recommendedHospitals: data.recommendedHospitals,
    horizonPrivateConciergeSOS: {
      hotline: '+91 (0) 800-HORIZON-SOS (24/7 Priority Emergency)',
      services: [
        'Immediate private medical air ambulance evacuation coordination',
        'Direct connection with nearest diplomatic embassy / high commission',
        'VIP bilingual translator dispatch to medical facilities',
        'Emergency sanctuary relocation and private charter routing'
      ]
    }
  });
}
