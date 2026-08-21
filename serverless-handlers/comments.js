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
    created_at: '2026-08-02T11:00:00.000Z',
    likes: []
  },
  {
    _id: 'cmt_goa_1_r1',
    place_id: 'goa',
    parent_id: 'cmt_goa_1',
    user_id: 'u_102',
    user_name: 'Priya Nair',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    text: 'Totally agree! The 5:30 PM slot has the best lighting for photos too.',
    status: 'APPROVED',
    created_at: '2026-08-02T13:00:00.000Z',
    likes: []
  },
  {
    _id: 'cmt_goa_2',
    place_id: 'goa',
    user_id: 'u_102',
    user_name: 'Priya Nair',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    text: 'Fontainhas is stunning in the early morning light, and much less crowded.',
    status: 'APPROVED',
    created_at: '2026-08-06T09:30:00.000Z',
    likes: []
  },
  {
    _id: 'cmt_taj_1',
    place_id: 'taj-mahal',
    user_id: 'u_105',
    user_name: 'Rohan Mehta',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    text: 'Sunrise entry to the Taj is worth every rupee — you get the monument almost to yourself.',
    status: 'APPROVED',
    created_at: '2026-08-03T06:45:00.000Z',
    likes: []
  }
];

// Resolve the authenticated user from the request (if any).
function getAuthUser(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// Build a threaded comment tree from a flat list.
function buildThread(flatComments) {
  const byId = new Map();
  const roots = [];

  flatComments.forEach((c) => {
    byId.set(String(c._id), { ...c, replies: [], likeCount: (c.likes || []).length });
  });

  byId.forEach((c) => {
    const parent = c.parent_id ? byId.get(String(c.parent_id)) : null;
    if (parent) {
      parent.replies.push(c);
    } else {
      roots.push(c);
    }
  });

  const sortNewest = (arr) => arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  sortNewest(roots);
  roots.forEach((root) => sortNewest(root.replies));
  return roots;
}

export default async function handler(req, res) {
  let commentsColl;
  try {
    const { db } = await connectToDatabase();
    commentsColl = db.collection(COLLECTIONS.comments);
  } catch {
    if (req.method === 'GET') {
      return res.status(200).json({
        available: false,
        comments: [],
        totalCount: 0,
        error: 'Traveler comments are temporarily unavailable.'
      });
    }
    return res.status(503).json({ error: 'Comments are temporarily unavailable.' });
  }

  // GET: Fetch comments for a place (approved only by default), threaded
  if (req.method === 'GET') {
    try {
      const { place_id, admin } = req.query || {};
      const authUser = getAuthUser(req);

      const filter = {};
      if (place_id) filter.place_id = place_id;
      if (!admin) filter.status = 'APPROVED';

      const cursor = await commentsColl.find(filter);
      let comments = await cursor.toArray();

      // Seed initial authentic comments if empty (persist them so replies/likes work)
      if (process.env.LEGACY_DEMO_MODE === '1' && comments.length === 0 && place_id) {
        const initialForPlace = INITIAL_COMMENTS.filter((c) => c.place_id === place_id);
        for (const c of initialForPlace) {
          const existing = await commentsColl.findOne({ _id: c._id });
          if (!existing) {
            await commentsColl.insertOne(c);
          }
        }
        comments = initialForPlace;
      } else if (process.env.LEGACY_DEMO_MODE === '1' && comments.length === 0 && !place_id) {
        comments = INITIAL_COMMENTS;
      }

      // Stamp likedByUser for the current authenticated user
      comments = comments.map((c) => ({
        ...c,
        likedByUser: Boolean(authUser && (c.likes || []).includes(authUser.sub))
      }));

      const thread = buildThread(comments);
      const totalCount = thread.reduce((acc, c) => acc + 1 + c.replies.length, 0);

      return res.status(200).json({ comments: thread, totalCount });
    } catch (err) {
      console.error('[GET /api/comments]', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // POST: Add a comment or reply (Authenticated users)
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

    const { place_id, text, parent_id } = req.body || {};
    if (!place_id || !text || !String(text).trim()) {
      return res.status(400).json({ error: 'Place ID and comment text are required.' });
    }

    // If replying, ensure the parent comment exists.
    if (parent_id) {
      const parent = await commentsColl.findOne({ _id: parent_id });
      if (!parent) {
        return res.status(400).json({ error: 'The comment you are replying to no longer exists.' });
      }
    }

    const userName = authUser.email ? authUser.email.split('@')[0] : 'Traveler';
    const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    const newComment = {
      place_id,
      user_id: authUser.sub,
      user_name: userName,
      user_avatar: userAvatar,
      text: String(text).trim(),
      parent_id: parent_id || null,
      status: 'APPROVED',
      likes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const result = await commentsColl.insertOne(newComment);
      return res.status(201).json({
        message: parent_id ? 'Reply added successfully!' : 'Comment added successfully!',
        comment: { _id: result.insertedId, ...newComment, replies: [], likeCount: 0, likedByUser: false }
      });
    } catch (err) {
      console.error('[POST /api/comments]', err);
      return res.status(500).json({ error: 'Could not post comment.' });
    }
  }

  // PATCH: Like/unlike (authenticated) OR admin approve/reject
  if (req.method === 'PATCH') {
    const { id, status, action } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Comment ID required' });

    // Admin moderation path
    if (status) {
      try {
        await commentsColl.updateOne({ _id: id }, { $set: { status, updated_at: new Date().toISOString() } });
        return res.status(200).json({ message: `Comment status updated to ${status}` });
      } catch (err) {
        console.error('[PATCH /api/comments]', err);
        return res.status(500).json({ error: 'Failed to update comment status' });
      }
    }

    // Like / unlike path (authenticated)
    if (action === 'like' || action === 'unlike') {
      const token = getTokenFromReq(req);
      if (!token) {
        return res.status(401).json({ error: 'Please sign in to like comments.' });
      }

      let authUser;
      try {
        authUser = verifyToken(token);
      } catch {
        return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
      }

      try {
        const existing = await commentsColl.findOne({ _id: id });
        if (!existing) {
          return res.status(404).json({ error: 'Comment not found.' });
        }

        const likes = Array.isArray(existing.likes) ? existing.likes : [];
        const alreadyLiked = likes.includes(authUser.sub);
        const liked = action === 'like' ? !alreadyLiked : false;

        const nextLikes = liked
          ? [...likes.filter((uid) => uid !== authUser.sub), authUser.sub]
          : likes.filter((uid) => uid !== authUser.sub);

        await commentsColl.updateOne({ _id: id }, { $set: { likes: nextLikes, updated_at: new Date().toISOString() } });

        return res.status(200).json({
          message: liked ? 'Comment liked' : 'Like removed',
          commentId: id,
          liked,
          likeCount: nextLikes.length
        });
      } catch (err) {
        console.error('[PATCH /api/comments]', err);
        return res.status(500).json({ error: 'Failed to update like' });
      }
    }

    return res.status(400).json({ error: 'Action or status required.' });
  }

  // DELETE: Delete comment
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Comment ID required' });

    try {
      await commentsColl.deleteOne({ _id: id });
      await commentsColl.deleteMany({ parent_id: id });
      return res.status(200).json({ message: 'Comment and replies deleted' });
    } catch (err) {
      console.error('[DELETE /api/comments]', err);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
