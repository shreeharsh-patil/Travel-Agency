import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { authenticateRequest } from '../lib/requestAuth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const auth = await authenticateRequest(req, res);
    if (!auth) return;
    const { db } = await connectToDatabase();
    const reservations = await db.collection(COLLECTIONS.reservations).find({ userId: auth.id }).sort({ createdAt: -1 }).toArray();
    return res.json({ bookings: reservations.map(({ _id, ...booking }) => ({ id: String(_id), ...booking })) });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const {
    firstName,
    lastName,
    email,
    phone,
    guests,
    startDate,
    tier,
    notes,
    addons,
    destination,
    destinationLocation,
    totalEstimate,
    bookingReference,
  } = body;

  if (!firstName || !email) {
    return res.status(400).json({ error: 'First name and email are required.' });
  }

  try {
    const auth = await authenticateRequest(req, res);
    if (!auth) return;
    const { db } = await connectToDatabase();

    const doc = {
      firstName,
      lastName: lastName || null,
      email,
      phone: phone || null,
      guests: guests || null,
      startDate: startDate || null,
      tier: tier || null,
      notes: notes || null,
      addons: Array.isArray(addons) ? addons : [],
      destination: destination || null,
      destinationLocation: destinationLocation || null,
      totalEstimate: Number(totalEstimate) || null,
      bookingReference: bookingReference || null,
      userId: auth.id,
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.reservations).insertOne(doc);

    return res.status(201).json({
      ok: true,
      id: result.insertedId.toString(),
      bookingReference: doc.bookingReference,
      message: 'Reservation received. Our concierge will reach out shortly.',
    });
  } catch (err) {
    console.error('[reservations]', err);
    return res.status(500).json({ error: 'Could not save reservation. Please try again.' });
  }
}
