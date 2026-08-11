import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';
import { blogData } from '../src/data/blogData.js';

/**
 * Journal / Blog API
 *  - GET    /api/blog             (public) published posts
 *  - GET    /api/blog?id=         (public) single post
 *  - GET    /api/blog?admin=true  (client-gated admin) all posts incl. drafts
 *  - POST   /api/blog             (auth) create a post
 *  - PATCH  /api/blog             (auth) update a post
 *  - DELETE /api/blog?id=         (auth) delete a post
 */

function makeSlug(title) {
  const slug = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || `post-${Date.now()}`;
}

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const blogColl = db.collection(COLLECTIONS.blogPosts);

  // GET: published posts; ?admin=true returns all; ?id= returns single post
  if (req.method === 'GET') {
    try {
      const { id, admin } = req.query || {};

      if (id) {
        const post = await blogColl.findOne({ _id: id });
        if (!post) return res.status(404).json({ error: 'Article not found.' });
        return res.status(200).json({ post });
      }

      const filter = admin === 'true' ? {} : { published: true };
      const cursor = await blogColl.find(filter);
      let posts = await cursor.sort({ created_at: -1 }).toArray();

      // Seed the journal with the curated stories the first time the
      // collection is empty, so the page never looks bare.
      if (posts.length === 0 && admin !== 'true') {
        for (const article of blogData) {
          await blogColl.insertOne({
            title: article.title,
            slug: makeSlug(article.title),
            excerpt: article.excerpt || String(article.content).slice(0, 200),
            content: article.content,
            image: article.image,
            category: 'Journal',
            author: 'Horizon Curators',
            published: true,
            readTime: article.readTime,
            created_at: new Date(article.date).toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        const seeded = await blogColl.find(filter);
        posts = await seeded.sort({ created_at: -1 }).toArray();
      }

      return res.status(200).json({ posts });
    } catch (err) {
      console.error('[GET /api/blog]', err);
      return res.status(500).json({ error: 'Could not load articles.' });
    }
  }

  // POST: create an article (requires a signed-in user)
  if (req.method === 'POST') {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: 'Please sign in to write.' });

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const { title, excerpt, content, image, category, author, published } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const now = new Date().toISOString();
    const post = {
      title: String(title).trim(),
      slug: makeSlug(title),
      excerpt: String(excerpt || '').trim().slice(0, 400),
      content: String(content).trim(),
      image: image || '/images/swiss_alps.png',
      category: category || 'Journal',
      author: String(author || payload.email || 'Horizon Curators').trim(),
      published: published !== false,
      created_at: now,
      updated_at: now,
    };

    try {
      const result = await blogColl.insertOne(post);
      return res.status(201).json({ message: 'Article published.', post: { _id: result.insertedId, ...post } });
    } catch (err) {
      console.error('[POST /api/blog]', err);
      return res.status(500).json({ error: 'Could not save article.' });
    }
  }

  // PATCH: update an article (auth)
  if (req.method === 'PATCH') {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: 'Please sign in to edit.' });

    try {
      verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const { id, title, excerpt, content, image, category, author, published } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Article ID is required.' });

    const update = { updated_at: new Date().toISOString() };
    if (title !== undefined) {
      update.title = String(title).trim();
      update.slug = makeSlug(update.title);
    }
    if (excerpt !== undefined) update.excerpt = String(excerpt).trim().slice(0, 400);
    if (content !== undefined) update.content = String(content).trim();
    if (image !== undefined) update.image = image;
    if (category !== undefined) update.category = String(category).trim();
    if (author !== undefined) update.author = String(author).trim();
    if (published !== undefined) update.published = published !== false;

    try {
      const result = await blogColl.updateOne({ _id: id }, { $set: update });
      if (!result.matchedCount) return res.status(404).json({ error: 'Article not found.' });
      return res.status(200).json({ message: 'Article updated.' });
    } catch (err) {
      console.error('[PATCH /api/blog]', err);
      return res.status(500).json({ error: 'Could not update article.' });
    }
  }

  // DELETE: remove an article (auth)
  if (req.method === 'DELETE') {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: 'Please sign in.' });

    try {
      verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Article ID is required.' });

    try {
      await blogColl.deleteOne({ _id: id });
      return res.status(200).json({ message: 'Article deleted.' });
    } catch (err) {
      console.error('[DELETE /api/blog]', err);
      return res.status(500).json({ error: 'Could not delete article.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
