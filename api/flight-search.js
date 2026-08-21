import { amadeusGet } from '../lib/travel/amadeus.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults = '1', travelClass } = req.query || {};
  if (!originLocationCode || !destinationLocationCode || !departureDate) return res.status(400).json({ error: 'Origin, destination and departure date are required.' });
  try {
    const params = { originLocationCode: String(originLocationCode).toUpperCase(), destinationLocationCode: String(destinationLocationCode).toUpperCase(), departureDate, adults: String(Math.max(1, Number(adults))), max: '30' };
    if (returnDate) params.returnDate = returnDate;
    if (travelClass) params.travelClass = travelClass;
    const result = await amadeusGet('/v2/shopping/flight-offers', params);
    if (!result.configured) return res.status(503).json({ available: false, error: 'Live flight shopping is temporarily unavailable.', provider: 'Amadeus' });
    const flights = (result.data.data || []).map((offer) => {
      const itinerary = offer.itineraries?.[0]; const segments = itinerary?.segments || []; const first = segments[0] || {}; const last = segments.at(-1) || {};
      return { id: offer.id, provider: 'Amadeus', airline: first.carrierCode || null, airlineCode: first.carrierCode || null, flightNumber: first.number ? `${first.carrierCode}${first.number}` : null, origin: first.departure?.iataCode || null, destination: last.arrival?.iataCode || null, departureTime: first.departure?.at || null, arrivalTime: last.arrival?.at || null, duration: itinerary?.duration || null, stops: Math.max(0, segments.length - 1), cabin: first.cabin || null, baggage: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags || null, price: offer.price?.grandTotal || null, currency: offer.price?.currency || null, bookingUrl: null };
    });
    return res.json({ available: true, provider: 'Amadeus', lastUpdated: new Date().toISOString(), flights });
  } catch (error) {
    console.error('[flight-search] provider failure:', error.message);
    return res.status(502).json({ available: false, error: 'Live flight shopping is temporarily unavailable.', provider: 'Amadeus' });
  }
}
