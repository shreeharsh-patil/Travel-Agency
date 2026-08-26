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

  if (req.method === 'DELETE') {
    const auth = await authenticateRequest(req, res);
    if (!auth) return;
    const { id } = req.query || req.body || {};
    if (!id) return res.status(400).json({ error: 'Reservation ID is required.' });

    try {
      const { db } = await connectToDatabase();
      const { ObjectId } = await import('mongodb');
      let query = { userId: auth.id };
      try {
        query._id = new ObjectId(id);
      } catch {
        query.id = id;
      }
      const result = await db.collection(COLLECTIONS.reservations).updateOne(
        query,
        { $set: { status: 'cancelled', cancelledAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Reservation not found or unauthorized.' });
      }

      return res.json({ ok: true, message: 'Reservation successfully cancelled.' });
    } catch (err) {
      console.error('[DELETE /api/reservations]', err);
      return res.status(500).json({ error: 'Could not cancel reservation.' });
    }
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
    endDate,
    nights,
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
      endDate: endDate || null,
      nights: Number(nights) || 1,
      tier: tier || null,
      notes: notes || null,
      addons: Array.isArray(addons) ? addons : [],
      destination: destination || null,
      destinationLocation: destinationLocation || null,
      totalEstimate: Number(totalEstimate) || null,
      bookingReference: bookingReference || null,
      userId: auth.id,
      status: 'confirmed',
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.reservations).insertOne(doc);

    return res.status(201).json({
      ok: true,
      id: result.insertedId.toString(),
      bookingReference: doc.bookingReference,
      message: 'Reservation confirmed! Details are saved in your account.',
    });
  } catch (err) {
    console.error('[reservations]', err);
    return res.status(500).json({ error: 'Could not save reservation. Please try again.' });
  }
}

