import { amadeusGet } from '../lib/travel/amadeus.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { cityCode, checkInDate, checkOutDate, adults = '1', roomQuantity = '1' } = req.query || {};
  if (!cityCode || !checkInDate || !checkOutDate) return res.status(400).json({ error: 'cityCode, checkInDate and checkOutDate are required.' });
  try {
    const result = await amadeusGet('/v3/shopping/hotel-offers', { cityCode: String(cityCode).toUpperCase(), checkInDate, checkOutDate, adults: String(Math.max(1, Number(adults))), roomQuantity: String(Math.max(1, Number(roomQuantity))) });
    if (!result.configured) return res.status(503).json({ available: false, error: 'Live hotel data is temporarily unavailable.', provider: 'Amadeus' });
    const hotels = (result.data.data || []).map((entry) => {
      const offer = entry.offers?.[0];
      const hotel = entry.hotel || {};
      return { id: entry.hotel?.hotelId, provider: 'Amadeus', name: hotel.name, description: hotel.description?.text || null, latitude: hotel.latitude || null, longitude: hotel.longitude || null, address: [hotel.address?.lines?.join(', '), hotel.address?.cityName, hotel.address?.countryCode].filter(Boolean).join(', '), city: hotel.address?.cityName || null, country: hotel.address?.countryCode || null, rating: null, reviewScore: null, reviewCount: null, stars: hotel.rating || null, photos: [], amenities: hotel.amenities || [], roomTypes: offer?.room?.typeEstimated?.category ? [offer.room.typeEstimated.category] : [], currency: offer?.price?.currency || null, price: offer?.price?.total || null, taxes: offer?.price?.taxes || [], cancellationPolicy: offer?.policies?.cancellations || [], availability: Boolean(offer), bookingUrl: null, lastUpdated: new Date().toISOString() };
    });
    return res.json({ available: true, provider: 'Amadeus', lastUpdated: new Date().toISOString(), hotels });
  } catch (error) {
    console.error('[hotels] provider failure:', error.message);
    return res.status(502).json({ available: false, error: 'Live hotel data is temporarily unavailable.', provider: 'Amadeus' });
  }
}
