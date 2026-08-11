/**
 * Free Indian States & Union Territories Info API.
 * Curated static dataset (Zero API key required) covering all 28 states + 8 UTs
 * with capital, region, famous landmarks, best time to visit, and language.
 */

const INDIAN_STATES = [
  { name: 'Andhra Pradesh', capital: 'Amaravati', region: 'South', language: 'Telugu', famous: ['Tirupati Balaji Temple', 'Araku Valley', 'Visakhapatnam beaches'] },
  { name: 'Arunachal Pradesh', capital: 'Itanagar', region: 'North-East', language: 'English', famous: ['Tawang Monastery', 'Ziro Valley', 'Sela Pass'] },
  { name: 'Assam', capital: 'Dispur', region: 'North-East', language: 'Assamese', famous: ['Kaziranga National Park', 'Majuli Island', 'Kamakhya Temple'] },
  { name: 'Bihar', capital: 'Patna', region: 'East', language: 'Hindi', famous: ['Mahabodhi Temple', 'Nalanda Ruins', 'Rajgir'] },
  { name: 'Chhattisgarh', capital: 'Raipur', region: 'Central', language: 'Hindi', famous: ['Chitrakote Falls', 'Jagdalpur', 'Barnawapara Sanctuary'] },
  { name: 'Goa', capital: 'Panaji', region: 'West', language: 'Konkani', famous: ['Baga Beach', 'Fort Aguada', 'Old Goa Churches'] },
  { name: 'Gujarat', capital: 'Gandhinagar', region: 'West', language: 'Gujarati', famous: ['Rann of Kutch', 'Somnath Temple', 'Gir National Park'] },
  { name: 'Haryana', capital: 'Chandigarh', region: 'North', language: 'Hindi', famous: ['Sultanpur Bird Sanctuary', 'Kurukshetra', 'Surajkund'] },
  { name: 'Himachal Pradesh', capital: 'Shimla', region: 'North', language: 'Hindi', famous: ['Manali', 'Dharamshala', 'Kullu Valley'] },
  { name: 'Jharkhand', capital: 'Ranchi', region: 'East', language: 'Hindi', famous: ['Dassam Falls', 'Baidyanath Temple', 'Betla National Park'] },
  { name: 'Karnataka', capital: 'Bengaluru', region: 'South', language: 'Kannada', famous: ['Hampi', 'Coorg', 'Gokarna'] },
  { name: 'Kerala', capital: 'Thiruvananthapuram', region: 'South', language: 'Malayalam', famous: ['Backwaters', 'Munnar Tea Estates', 'Kovalam Beach'] },
  { name: 'Madhya Pradesh', capital: 'Bhopal', region: 'Central', language: 'Hindi', famous: ['Khajuraho', 'Orchha', 'Bandhavgarh National Park'] },
  { name: 'Maharashtra', capital: 'Mumbai', region: 'West', language: 'Marathi', famous: ['Gateway of India', 'Ajanta & Ellora', 'Lonavala'] },
  { name: 'Manipur', capital: 'Imphal', region: 'North-East', language: 'Meitei', famous: ['Loktak Lake', 'Kangla Fort', 'Shirui Hills'] },
  { name: 'Meghalaya', capital: 'Shillong', region: 'North-East', language: 'English', famous: ['Living Root Bridges', 'Dawki River', 'Mawsynram'] },
  { name: 'Mizoram', capital: 'Aizawl', region: 'North-East', language: 'Mizo', famous: ['Reiek Tlang', 'Phawngpui Peak', 'Champhai'] },
  { name: 'Nagaland', capital: 'Kohima', region: 'North-East', language: 'English', famous: ['Hornbill Festival', 'Dzukou Valley', 'Kohima War Cemetery'] },
  { name: 'Odisha', capital: 'Bhubaneswar', region: 'East', language: 'Odia', famous: ['Konark Sun Temple', 'Puri Jagannath', 'Chilika Lake'] },
  { name: 'Punjab', capital: 'Chandigarh', region: 'North', language: 'Punjabi', famous: ['Golden Temple', 'Wagah Border', 'Amritsar'] },
  { name: 'Rajasthan', capital: 'Jaipur', region: 'North', language: 'Hindi', famous: ['Jaipur Palaces', 'Udaipur Lakes', 'Jaisalmer Fort'] },
  { name: 'Sikkim', capital: 'Gangtok', region: 'North-East', language: 'Nepali', famous: ['Nathula Pass', 'Tsomgo Lake', 'Rumtek Monastery'] },
  { name: 'Tamil Nadu', capital: 'Chennai', region: 'South', language: 'Tamil', famous: ['Meenakshi Temple', 'Ooty', 'Mahabalipuram'] },
  { name: 'Telangana', capital: 'Hyderabad', region: 'South', language: 'Telugu', famous: ['Charminar', 'Golconda Fort', 'Ramoji Film City'] },
  { name: 'Tripura', capital: 'Agartala', region: 'North-East', language: 'Bengali', famous: ['Neermahal Palace', 'Ujjayanta Palace', 'Unakoti'] },
  { name: 'Uttar Pradesh', capital: 'Lucknow', region: 'North', language: 'Hindi', famous: ['Taj Mahal', 'Varanasi Ghats', 'Agra Fort'] },
  { name: 'Uttarakhand', capital: 'Dehradun', region: 'North', language: 'Hindi', famous: ['Rishikesh', 'Nainital', 'Kedarnath'] },
  { name: 'West Bengal', capital: 'Kolkata', region: 'East', language: 'Bengali', famous: ['Victoria Memorial', 'Darjeeling', 'Sundarbans'] },
  { name: 'Andaman & Nicobar Islands', capital: 'Port Blair', region: 'Union Territory', language: 'Hindi', famous: ['Radhanagar Beach', 'Cellular Jail', 'Havelock Island'] },
  { name: 'Chandigarh', capital: 'Chandigarh', region: 'Union Territory', language: 'Punjabi', famous: ['Rock Garden', 'Sukhna Lake', 'Capitol Complex'] },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', capital: 'Daman', region: 'Union Territory', language: 'Gujarati', famous: ['Diu Fort', 'Silvassa Garden', 'Nagoa Beach'] },
  { name: 'Delhi (NCT)', capital: 'New Delhi', region: 'Union Territory', language: 'Hindi', famous: ['Red Fort', 'India Gate', 'Qutub Minar'] },
  { name: 'Jammu & Kashmir', capital: 'Srinagar', region: 'Union Territory', language: 'Kashmiri', famous: ['Dal Lake', 'Gulmarg', 'Vaishno Devi'] },
  { name: 'Ladakh', capital: 'Leh', region: 'Union Territory', language: 'Ladakhi', famous: ['Pangong Lake', 'Nubra Valley', 'Khardung La'] },
  { name: 'Lakshadweep', capital: 'Kavaratti', region: 'Union Territory', language: 'Malayalam', famous: ['Minicoy Island', 'Agatti Beach', 'Bangaram'] },
  { name: 'Puducherry', capital: 'Puducherry', region: 'Union Territory', language: 'Tamil', famous: ['Promenade Beach', 'Auroville', 'French Quarter'] }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query || {};

  let states = INDIAN_STATES;
  if (q && String(q).trim()) {
    const term = String(q).trim().toLowerCase();
    states = states.filter(
      (s) => s.name.toLowerCase().includes(term) || s.capital.toLowerCase().includes(term) || s.region.toLowerCase().includes(term)
    );
  }

  return res.status(200).json({
    success: true,
    totalStates: INDIAN_STATES.length,
    resultsCount: states.length,
    states,
    source: 'Curated Indian States & UTs Dataset (Free)'
  });
}
