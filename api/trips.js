import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';

/**
 * Trip Itinerary API
 *  - POST   /api/trips            (auth) save a trip to the account, returns shareId
 *  - GET    /api/trips            (auth) list my trips
 *  - GET    /api/trips?share=ID   (public) fetch a shared trip by shareId
 *  - DELETE /api/trips?id=        (auth) delete one of my trips
 */

function generateShareId() {
  return `HZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const tripsColl = db.collection(COLLECTIONS.trips);

  // POST: Save a trip to the account (authenticated)
  if (req.method === 'POST') {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Please sign in to sync trips.' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid session. Please sign in again.' });
    }

    const {
      title,
      destination,
      durationDays,
      travelers,
      budgetINR,
      formattedBudget,
      itineraryDays,
      interests,
      notes,
    } = req.body || {};

    if (!destination) {
      return res.status(400).json({ error: 'Trip destination is required.' });
    }

    const trip = {
      userId: payload.sub,
      userEmail: payload.email,
      title: title || `${destination} Itinerary`,
      destination,
      durationDays: parseInt(durationDays, 10) || 3,
      travelers: travelers || '2 Guests',
      budgetINR: budgetINR || 0,
      formattedBudget: formattedBudget || '',
      itineraryDays: Array.isArray(itineraryDays) ? itineraryDays : [],
      interests: Array.isArray(interests) ? interests : [],
      notes: notes || '',
      shareId: generateShareId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const result = await tripsColl.insertOne(trip);
      return res.status(201).json({
        message: 'Trip synced to your account.',
        trip: { _id: result.insertedId, ...trip },
      });
    } catch (err) {
      console.error('[POST /api/trips]', err);
      return res.status(500).json({ error: 'Could not sync trip.' });
    }
  }

  // GET: list my trips (auth) OR fetch a public shared trip (?share=SHAREID)
  if (req.method === 'GET') {
    const { share } = req.query || {};

    if (share) {
      try {
        const trip = await tripsColl.findOne({ shareId: String(share).trim() });
        if (!trip) {
          return res.status(404).json({ error: 'Shared trip not found.' });
        }
        // Strip owner info from the public view.
        const { userId: _userId, userEmail: _userEmail, ...publicTrip } = trip;

        return res.status(200).json({ trip: { ...publicTrip, shared: true } });
      } catch (err) {
        console.error('[GET /api/trips?share=]', err);
        return res.status(500).json({ error: 'Could not load shared trip.' });
      }
    }

    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Please sign in to view your trips.' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid session. Please sign in again.' });
    }

    try {
      const cursor = await tripsColl.find({ userId: payload.sub });
      const trips = await cursor.sort({ created_at: -1 }).toArray();
      return res.status(200).json({ trips });
    } catch (err) {
      console.error('[GET /api/trips]', err);
      return res.status(500).json({ error: 'Could not load your trips.' });
    }
  }

  // DELETE: remove one of my trips
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).json({ error: 'Trip ID is required.' });
    }

    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Please sign in.' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid session. Please sign in again.' });
    }

    try {
      await tripsColl.deleteOne({ _id: id, userId: payload.sub });
      return res.status(200).json({ message: 'Trip deleted.' });
    } catch (err) {
      console.error('[DELETE /api/trips]', err);
      return res.status(500).json({ error: 'Could not delete trip.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
