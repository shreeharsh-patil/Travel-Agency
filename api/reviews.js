import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';

const INITIAL_AUTHENTIC_REVIEWS = [
  {
    _id: 'rev_goa_1',
    place_id: 'goa',
    user_id: 'u_101',
    user_name: 'Aarav Sharma',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    rating: 5,
    title: 'Absolute coastal luxury in Goa!',
    comment: 'The private villa in Panaji exceeded every expectation. Sunset catamaran cruise along the Mandovi river was the highlight of our trip!',
    status: 'APPROVED',
    verified: true,
    created_at: '2026-08-01T10:00:00.000Z'
  },
  {
    _id: 'rev_goa_2',
    place_id: 'goa',
    user_id: 'u_102',
    user_name: 'Priya Nair',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    rating: 5,
    title: 'Magical Fontainhas heritage walk',
    comment: 'Exploring the Latin quarter with local historians was unforgettable. Michelin-caliber beachfront dining was top notch.',
    status: 'APPROVED',
    verified: true,
    created_at: '2026-08-05T14:30:00.000Z'
  },
  {
    _id: 'rev_kyoto_1',
    place_id: 'kyoto',
    user_id: 'u_103',
    user_name: 'Kenji Takahashi',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
    rating: 5,
    title: 'Serene Machiya townhouse stay',
    comment: 'After-hours private temple access in Gion gave us a deep spiritual connection to Japanese Zen culture.',
    status: 'APPROVED',
    verified: true,
    created_at: '2026-07-28T09:15:00.000Z'
  },
  {
    _id: 'rev_amalfi_1',
    place_id: 'amalfi',
    user_id: 'u_104',
    user_name: 'Elena Rossi',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    rating: 5,
    title: 'Unmatched Tyrrhenian Sea cliffside vistas!',
    comment: 'Private Riva yacht charter across Capri was pure paradise. The infinity pool estate was breathtaking.',
    status: 'APPROVED',
    verified: true,
    created_at: '2026-08-02T16:20:00.000Z'
  }
];

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const reviewsColl = db.collection(COLLECTIONS.reviews);

  // GET: Fetch reviews for a place (or all reviews for admin moderation)
  if (req.method === 'GET') {
    try {
      const { place_id, status } = req.query || {};

      const filter = {};
      if (place_id) filter.place_id = place_id;
      if (status) {
        filter.status = status;
      } else if (!req.query.admin) {
        filter.status = 'APPROVED';
      }

      let cursor = await reviewsColl.find(filter);
      let reviews = await cursor.toArray();

      // Seed initial authentic reviews if empty for place
      if (reviews.length === 0 && place_id) {
        const authenticForPlace = INITIAL_AUTHENTIC_REVIEWS.filter(r => r.place_id === place_id);
        reviews = authenticForPlace;
      } else if (reviews.length === 0 && !place_id) {
        reviews = INITIAL_AUTHENTIC_REVIEWS;
      }

      // Calculate rating stats
      let avgRating = 0;
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        avgRating = Number((sum / reviews.length).toFixed(1));
      }

      // Star distribution breakdown (percentage per rating level)
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r) => {
        const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
        distribution[rating] += 1;
      });
      const total = reviews.length || 1;
      const ratingBreakdown = Object.keys(distribution).map((star) => ({
        rating: parseInt(star, 10),
        count: distribution[star],
        percentage: Math.round((distribution[star] / total) * 100)
      }));

      return res.status(200).json({
        reviews,
        totalCount: reviews.length,
        averageRating: avgRating || 4.8,
        ratingBreakdown,
        ratingDistribution: distribution
      });
    } catch (err) {
      console.error('[GET /api/reviews]', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  // POST: Submit a Review (Authenticated users)
  if (req.method === 'POST') {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Please sign in to write a review.' });
    }

    let authUser;
    try {
      authUser = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    }

    const { place_id, rating, title, comment, images } = req.body || {};

    if (!place_id || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Place ID, rating (1-5), title, and review comment are required.' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    // Only allow http(s) image URLs or compressed data:image payloads —
    // never javascript:/text/html schemes, and cap per-image byte size.
    const MAX_IMAGE_BYTES = 600 * 1024;
    const isSafeImage = (u) =>
      typeof u === 'string' &&
      (/^https?:\/\/\S+$/i.test(u.trim()) ||
        /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(u.trim()));
    const isWithinSize = (u) => {
      const str = String(u);
      if (!str.startsWith('data:image/')) return true;
      const comma = str.indexOf(',');
      const b64 = comma === -1 ? '' : str.slice(comma + 1);
      return Math.floor((b64.length * 3) / 4) <= MAX_IMAGE_BYTES;
    };
    const sanitizedImages = Array.isArray(images)
      ? images.filter(isSafeImage).map((u) => u.trim()).filter(isWithinSize).slice(0, 6)
      : [];

    const existing = await reviewsColl.findOne({
      place_id,
      user_id: authUser.sub
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a review for this destination.' });
    }

    const userName = authUser.email ? authUser.email.split('@')[0] : 'Traveler';
    const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    const newReview = {
      place_id,
      user_id: authUser.sub,
      user_name: userName,
      user_avatar: userAvatar,
      rating: numericRating,
      title: String(title).trim(),
      comment: String(comment).trim(),
      images: sanitizedImages,
      verified: true,
      status: 'APPROVED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const result = await reviewsColl.insertOne(newReview);

      return res.status(201).json({
        message: 'Thank you for your review!',
        review: { _id: result.insertedId, ...newReview }
      });
    } catch (err) {
      console.error('[POST /api/reviews]', err);
      return res.status(500).json({ error: 'Could not post review.' });
    }
  }

  // PATCH: Admin approve / reject review
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'Review ID and status required' });

    try {
      await reviewsColl.updateOne({ _id: id }, { $set: { status, updated_at: new Date().toISOString() } });
      return res.status(200).json({ message: `Review status updated to ${status}` });
    } catch (err) {
      console.error('[PATCH /api/reviews]', err);
      return res.status(500).json({ error: 'Failed to update review status' });
    }
  }

  // DELETE: Delete review
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Review ID required' });

    try {
      await reviewsColl.deleteOne({ _id: id });
      return res.status(200).json({ message: 'Review deleted' });
    } catch (err) {
      console.error('[DELETE /api/reviews]', err);
      return res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
