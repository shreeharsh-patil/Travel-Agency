import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';

const INITIAL_COMMENTS = [
  {
    _id: 'cmt_goa_1',
    place_id: 'goa',
    user_id: 'u_101',
    user_name: 'Aarav Sharma',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    text: 'The sunset cruise on the Mandovi river is an absolute must — book the golden hour slot!',
    status: 'APPROVED',
    created_at: '2026-08-02T11:00:00.000Z'
  },
  {
    _id: 'cmt_goa_2',
    place_id: 'goa',
    user_id: 'u_102',
    user_name: 'Priya Nair',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    text: 'Fontainhas is stunning in the early morning light, and much less crowded.',
    status: 'APPROVED',
    created_at: '2026-08-06T09:30:00.000Z'
  },
  {
    _id: 'cmt_taj_1',
    place_id: 'taj-mahal',
    user_id: 'u_105',
    user_name: 'Rohan Mehta',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    text: 'Sunrise entry to the Taj is worth every rupee — you get the monument almost to yourself.',
    status: 'APPROVED',
    created_at: '2026-08-03T06:45:00.000Z'
  }
];

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const commentsColl = db.collection(COLLECTIONS.comments);

  // GET: Fetch comments for a place (approved only by default)
  if (req.method === 'GET') {
    try {
      const { place_id, admin } = req.query || {};

      const filter = {};
      if (place_id) filter.place_id = place_id;
      if (!admin) filter.status = 'APPROVED';

      const cursor = await commentsColl.find(filter);
      let comments = await cursor.toArray();

      // Seed initial authentic comments if empty
      if (comments.length === 0 && place_id) {
        comments = INITIAL_COMMENTS.filter((c) => c.place_id === place_id);
      } else if (comments.length === 0 && !place_id) {
        comments = INITIAL_COMMENTS;
      }

      comments.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      return res.status(200).json({ comments, totalCount: comments.length });
    } catch (err) {
      console.error('[GET /api/comments]', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // POST: Add a comment (Authenticated users)
  if (req.method === 'POST') {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: 'Please sign in to comment on a destination.' });
    }

    let authUser;
    try {
      authUser = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    }

    const { place_id, text } = req.body || {};
    if (!place_id || !text || !String(text).trim()) {
      return res.status(400).json({ error: 'Place ID and comment text are required.' });
    }

    const userName = authUser.email ? authUser.email.split('@')[0] : 'Traveler';
    const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    const newComment = {
      place_id,
      user_id: authUser.sub,
      user_name: userName,
      user_avatar: userAvatar,
      text: String(text).trim(),
      status: 'APPROVED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const result = await commentsColl.insertOne(newComment);
      return res.status(201).json({
        message: 'Comment added successfully!',
        comment: { _id: result.insertedId, ...newComment }
      });
    } catch (err) {
      console.error('[POST /api/comments]', err);
      return res.status(500).json({ error: 'Could not post comment.' });
    }
  }

  // PATCH: Admin approve / reject comment
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'Comment ID and status required' });

    try {
      await commentsColl.updateOne({ _id: id }, { $set: { status, updated_at: new Date().toISOString() } });
      return res.status(200).json({ message: `Comment status updated to ${status}` });
    } catch (err) {
      console.error('[PATCH /api/comments]', err);
      return res.status(500).json({ error: 'Failed to update comment status' });
    }
  }

  // DELETE: Delete comment
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Comment ID required' });

    try {
      await commentsColl.deleteOne({ _id: id });
      return res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
      console.error('[DELETE /api/comments]', err);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
