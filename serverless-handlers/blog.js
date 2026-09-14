import { ObjectId } from 'mongodb';
import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { authenticateRequest } from '../lib/requestAuth.js';
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

function postIdFilter(id) {
  const value = String(id || '').trim();
  if (ObjectId.isValid(value)) return { $or: [{ _id: new ObjectId(value) }, { _id: value }] };
  return { _id: value };
}

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
      const adminView = admin === 'true';
      if (adminView) {
        if (!(await authenticateRequest(req, res, { admin: true }))) return;
      }

      if (id) {
        const idFilter = postIdFilter(id);
        const post = await blogColl.findOne(adminView ? idFilter : { $and: [idFilter, { published: true }] });
        if (!post) return res.status(404).json({ error: 'Article not found.' });
        return res.status(200).json({ post });
      }

      const filter = adminView ? {} : { published: true };
      const cursor = await blogColl.find(filter);
      let posts = await cursor.sort({ created_at: -1 }).toArray();

      // Seed the journal with the curated stories the first time the
      // collection is empty, so neither the public page nor the admin
      // dashboard ever looks bare.
      if (posts.length === 0) {
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

  // POST: create an article (admin only)
  if (req.method === 'POST') {
    if (!(await authenticateRequest(req, res, { admin: true }))) return;

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
      author: String(author || auth.user.name || auth.user.email || 'Horizon Curators').trim(),
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

  // PATCH: update an article (admin only)
  if (req.method === 'PATCH') {
    if (!(await authenticateRequest(req, res, { admin: true }))) return;

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
      const result = await blogColl.updateOne(postIdFilter(id), { $set: update });
      if (!result.matchedCount) return res.status(404).json({ error: 'Article not found.' });
      return res.status(200).json({ message: 'Article updated.' });
    } catch (err) {
      console.error('[PATCH /api/blog]', err);
      return res.status(500).json({ error: 'Could not update article.' });
    }
  }

  // DELETE: remove an article (admin only)
  if (req.method === 'DELETE') {
    if (!(await authenticateRequest(req, res, { admin: true }))) return;

    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Article ID is required.' });

    try {
      const result = await blogColl.deleteOne(postIdFilter(id));
      if (!result.deletedCount) return res.status(404).json({ error: 'Article not found.' });
      return res.status(200).json({ message: 'Article deleted.' });
    } catch (err) {
      console.error('[DELETE /api/blog]', err);
      return res.status(500).json({ error: 'Could not delete article.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
