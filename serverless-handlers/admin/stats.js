import { connectToDatabase, COLLECTIONS } from '../../lib/db.js';
import { authenticateRequest } from '../../lib/requestAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!(await authenticateRequest(req, res, { admin: true }))) return;

  try {
    const { db } = await connectToDatabase();
    const placesColl = db.collection(COLLECTIONS.places);
    const reviewsColl = db.collection(COLLECTIONS.reviews);
    const usersColl = db.collection(COLLECTIONS.users);
    const blogColl = db.collection(COLLECTIONS.blogPosts);
    const newsletterColl = db.collection(COLLECTIONS.newsletter);
    const tripsColl = db.collection(COLLECTIONS.trips);

    const totalPlaces = await placesColl.countDocuments({});
    const pendingPlaces = await placesColl.countDocuments({ status: 'PENDING' });
    const approvedPlaces = await placesColl.countDocuments({ status: 'APPROVED' });

    const totalReviews = await reviewsColl.countDocuments({});
    const pendingReviews = await reviewsColl.countDocuments({ status: 'PENDING' });

    const reviewsCursor = await reviewsColl.find({ status: 'APPROVED' });
    const reviewsList = await reviewsCursor.toArray();
    
    let averageRating = null;
    if (reviewsList.length > 0) {
      const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0);
      averageRating = Number((sum / reviewsList.length).toFixed(1));
    }

    const recentPlacesCursor = await placesColl.find({});
    const sortedPlaces = await recentPlacesCursor.sort({ created_at: -1 });
    const recentSubmissions = (await sortedPlaces.toArray()).slice(0, 5);

    return res.status(200).json({
      stats: {
        totalPlaces,
        pendingPlaces,
        approvedPlaces,
        totalReviews,
        pendingReviews,
        averageRating,
        totalUsers: await usersColl.countDocuments({}),
        totalBlogPosts: await blogColl.countDocuments({}),
        publishedBlogPosts: await blogColl.countDocuments({ published: true }),
        totalNewsletterSubscribers: await newsletterColl.countDocuments({}),
        totalTrips: await tripsColl.countDocuments({})
      },
      recentSubmissions
    });
  } catch (err) {
    console.error('[GET /api/admin/stats]', err);
    return res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
}
