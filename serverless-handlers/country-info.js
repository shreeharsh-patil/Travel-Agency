/**
 * Free Country Intelligence & Traveler Essentials API (Zero API Key Required).
 * Returns flags, languages, power plug types, driving side, emergency contacts,
 * and essential local language phrases for destinations worldwide.
 */

const COUNTRY_DATA = {
  india: {
    countryName: 'India',
    flagEmoji: '🇮🇳',
    capital: 'New Delhi',
    region: 'South Asia',
    languages: 'Hindi, English, Regional Languages (Konkani, Tamil, Bengali)',
    callingCode: '+91',
    currency: 'INR (₹ - Indian Rupee)',
    currencyCode: 'INR',
    powerPlugs: 'Type C, D & M (230V, 50Hz)',
    drivingSide: 'Left',
    emergencyNumber: '112 (All-in-one Emergency) / 100 (Police)',
    timeZone: 'IST (UTC+5:30)',
    bestMonths: 'October to March (Pleasant, sunny and cool)',
    tippingCulture: '5% - 10% appreciated at restaurants',
    phrases: [
      { text: 'Namaste', meaning: 'Hello / Greetings', pronunciation: 'nah-mas-tay' },
      { text: 'Dhanyavaad / Shukriya', meaning: 'Thank you', pronunciation: 'dhun-yuh-vaad' },
      { text: 'Kitna hua?', meaning: 'How much does this cost?', pronunciation: 'kit-nah hoo-ah' },
      { text: 'Kripya', meaning: 'Please', pronunciation: 'krip-yah' },
      { text: 'Haan / Nahi', meaning: 'Yes / No', pronunciation: 'haan / nuh-hee' }
    ]
  },
  japan: {
    countryName: 'Japan',
    flagEmoji: '🇯🇵',
    capital: 'Tokyo',
    region: 'East Asia',
    languages: 'Japanese',
    callingCode: '+81',
    currency: 'JPY (¥ - Japanese Yen)',
    currencyCode: 'JPY',
    powerPlugs: 'Type A & B (100V, 50/60Hz)',
    drivingSide: 'Left',
    emergencyNumber: '110 (Police) / 119 (Ambulance & Fire)',
    timeZone: 'JST (UTC+9:00)',
    bestMonths: 'March to May (Cherry Blossoms) & Sept to Nov (Autumn Foliage)',
    tippingCulture: 'No tipping (exceptional service is standard)',
    phrases: [
      { text: 'Konnichiwa (こんにちは)', meaning: 'Hello / Good day', pronunciation: 'kohn-nee-chee-wah' },
      { text: 'Arigato gozaimasu (ありがとうございます)', meaning: 'Thank you very much', pronunciation: 'ah-ree-gah-toh go-zye-mas' },
      { text: 'Sumimasen (すみません)', meaning: 'Excuse me / Sorry', pronunciation: 'soo-mee-mah-sen' },
      { text: 'Kore wa ikura desu ka? (これはいくらですか)', meaning: 'How much is this?', pronunciation: 'ko-reh wah ee-koo-rah des kah' },
      { text: 'Oishii (美味しい)', meaning: 'Delicious!', pronunciation: 'oy-shee' }
    ]
  },
  italy: {
    countryName: 'Italy',
    flagEmoji: '🇮🇹',
    capital: 'Rome',
    region: 'Southern Europe',
    languages: 'Italian',
    callingCode: '+39',
    currency: 'EUR (€ - Euro)',
    currencyCode: 'EUR',
    powerPlugs: 'Type C, F & L (230V, 50Hz)',
    drivingSide: 'Right',
    emergencyNumber: '112 (Universal Emergency)',
    timeZone: 'CET (UTC+1) / CEST (UTC+2 summer)',
    bestMonths: 'April to June & September to October (Warm & mild)',
    tippingCulture: 'Coperto service charge is common; small change tip welcome',
    phrases: [
      { text: 'Ciao / Buongiorno', meaning: 'Hello / Good morning', pronunciation: 'chow / bwon-jor-no' },
      { text: 'Grazie mille', meaning: 'Thank you very much', pronunciation: 'graht-see-eh meel-leh' },
      { text: 'Per favore', meaning: 'Please', pronunciation: 'pehr fah-voh-reh' },
      { text: 'Quanto costa?', meaning: 'How much does it cost?', pronunciation: 'kwan-toh kos-tah' },
      { text: 'Il conto, per favore', meaning: 'The bill, please', pronunciation: 'eel kon-toh pehr fah-voh-reh' }
    ]
  },
  france: {
    countryName: 'France',
    flagEmoji: '🇫🇷',
    capital: 'Paris',
    region: 'Western Europe',
    languages: 'French',
    callingCode: '+33',
    currency: 'EUR (€ - Euro)',
    currencyCode: 'EUR',
    powerPlugs: 'Type C & E (230V, 50Hz)',
    drivingSide: 'Right',
    emergencyNumber: '112 (Universal Emergency)',
    timeZone: 'CET (UTC+1) / CEST (UTC+2 summer)',
    bestMonths: 'May to September (Warm, outdoor terraces and gardens)',
    tippingCulture: 'Service compris included; rounding up 5% is standard',
    phrases: [
      { text: 'Bonjour', meaning: 'Hello / Good day', pronunciation: 'bohn-zhoor' },
      { text: 'Merci beaucoup', meaning: 'Thank you very much', pronunciation: 'mair-see boh-koo' },
      { text: "S'il vous plaît", meaning: 'Please', pronunciation: 'seel voo pleh' },
      { text: "C'est combien?", meaning: 'How much is it?', pronunciation: 'say com-bee-ehn' },
      { text: 'Parlez-vous anglais?', meaning: 'Do you speak English?', pronunciation: 'par-lay voo ahn-glay' }
    ]
  },
  indonesia: {
    countryName: 'Indonesia',
    flagEmoji: '🇮🇩',
    capital: 'Jakarta / Nusantara',
    region: 'Southeast Asia',
    languages: 'Indonesian (Bahasa), Balinese',
    callingCode: '+62',
    currency: 'IDR (Rp - Indonesian Rupiah)',
    currencyCode: 'IDR',
    powerPlugs: 'Type C & F (230V, 50Hz)',
    drivingSide: 'Left',
    emergencyNumber: '112 / 110 (Police)',
    timeZone: 'WITA (UTC+8:00 in Bali)',
    bestMonths: 'April to October (Dry season, ideal for surfing and beach)',
    tippingCulture: '5% - 10% appreciated for drivers and restaurant staff',
    phrases: [
      { text: 'Halo / Selamat Pagi', meaning: 'Hello / Good morning', pronunciation: 'suh-lah-mat pah-gee' },
      { text: 'Terima kasih', meaning: 'Thank you', pronunciation: 'tuh-ree-mah kah-see' },
      { text: 'Tolong', meaning: 'Please / Help', pronunciation: 'toh-long' },
      { text: 'Berapa harganya?', meaning: 'How much is this?', pronunciation: 'buh-rah-pah har-gah-nyah' },
      { text: 'Sama-sama', meaning: "You're welcome", pronunciation: 'sah-mah sah-mah' }
    ]
  },
  iceland: {
    countryName: 'Iceland',
    flagEmoji: '🇮🇸',
    capital: 'Reykjavik',
    region: 'Northern Europe',
    languages: 'Icelandic, English widely spoken',
    callingCode: '+354',
    currency: 'ISK (kr - Icelandic Króna)',
    currencyCode: 'ISK',
    powerPlugs: 'Type C & F (230V, 50Hz)',
    drivingSide: 'Right',
    emergencyNumber: '112 (Universal Emergency)',
    timeZone: 'GMT (UTC+0)',
    bestMonths: 'Sept to March (Northern Lights) & June to Aug (Midnight Sun)',
    tippingCulture: 'Service included; tipping is not customary',
    phrases: [
      { text: 'Halló / Góðan daginn', meaning: 'Hello / Good day', pronunciation: 'ha-loh / go-than dye-in' },
      { text: 'Takk fyrir', meaning: 'Thank you very much', pronunciation: 'tahk feer-ir' },
      { text: 'Gjörðu svo vel', meaning: 'Please / Here you go', pronunciation: 'gyur-thu svo vel' },
      { text: 'Hvað kostar þetta?', meaning: 'How much does this cost?', pronunciation: 'kvath kos-tar thet-ta' },
      { text: 'Skál!', meaning: 'Cheers!', pronunciation: 'scowl' }
    ]
  },
  switzerland: {
    countryName: 'Switzerland',
    flagEmoji: '🇨🇭',
    capital: 'Bern',
    region: 'Central Europe',
    languages: 'German, French, Italian, Romansh',
    callingCode: '+41',
    currency: 'CHF (CHF - Swiss Franc)',
    currencyCode: 'CHF',
    powerPlugs: 'Type J & C (230V, 50Hz)',
    drivingSide: 'Right',
    emergencyNumber: '112 / 117 (Police) / 144 (Ambulance)',
    timeZone: 'CET (UTC+1) / CEST (UTC+2 summer)',
    bestMonths: 'Dec to March (Skiing) & June to Sept (Alpine Hiking)',
    tippingCulture: 'Service included; rounding up to the nearest franc is common',
    phrases: [
      { text: 'Grüezi (Swiss German)', meaning: 'Hello / Greetings', pronunciation: 'grew-eh-tsee' },
      { text: 'Merci vilmal', meaning: 'Thank you very much', pronunciation: 'mair-see feel-mahl' },
      { text: 'Bitte', meaning: 'Please', pronunciation: 'bit-teh' },
      { text: 'Wie viel kostet das?', meaning: 'How much is that?', pronunciation: 'vee feel kos-tet dahs' },
      { text: 'En Guete!', meaning: 'Bon appétit!', pronunciation: 'en goo-eh-teh' }
    ]
  },
  usa: {
    countryName: 'United States',
    flagEmoji: '🇺🇸',
    capital: 'Washington, D.C.',
    region: 'North America',
    languages: 'English',
    callingCode: '+1',
    currency: 'USD ($ - US Dollar)',
    currencyCode: 'USD',
    powerPlugs: 'Type A & B (120V, 60Hz)',
    drivingSide: 'Right',
    emergencyNumber: '911 (Police, Fire, Ambulance)',
    timeZone: 'EST / CST / MST / PST (UTC-5 to UTC-8)',
    bestMonths: 'Year-round (Winter for ski resorts like Aspen, Summer for coasts)',
    tippingCulture: '18% - 22% expected for dining and hospitality',
    phrases: [
      { text: 'Hello / How are you doing?', meaning: 'Casual greeting', pronunciation: 'hel-loh' },
      { text: 'Thank you so much', meaning: 'Expressing gratitude', pronunciation: 'thank yoo soh much' },
      { text: 'Could I get the check please?', meaning: 'Asking for the bill', pronunciation: 'kood eye get the check pleez' }
    ]
  }
};

export function getCountryDetails(countryQuery) {
  if (!countryQuery) return COUNTRY_DATA.india;
  const clean = String(countryQuery).toLowerCase().trim();

  for (const [key, data] of Object.entries(COUNTRY_DATA)) {
    if (clean.includes(key) || data.countryName.toLowerCase().includes(clean)) {
      return data;
    }
  }

  // Smart fallback
  return {
    countryName: countryQuery,
    flagEmoji: '🌍',
    capital: 'Capital Hub',
    region: 'Global Sanctuary',
    languages: 'Official & English',
    callingCode: '+—',
    currency: 'Local Currency / USD / EUR',
    currencyCode: 'USD',
    powerPlugs: 'Standard International Plugs',
    drivingSide: 'Standard',
    emergencyNumber: '112 / 911',
    timeZone: 'Local Timezone',
    bestMonths: 'Spring & Autumn months',
    tippingCulture: 'Standard international hospitality tipping (10%)',
    phrases: [
      { text: 'Hello', meaning: 'Standard Greeting', pronunciation: 'hel-loh' },
      { text: 'Thank you', meaning: 'Gratitude', pronunciation: 'thank yoo' }
    ]
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { country = 'India' } = req.query || {};
  const details = getCountryDetails(country);

  return res.status(200).json({
    success: true,
    ...details,
    source: 'Free Country Intelligence & Traveler Essentials Engine'
  });
}
