import { connectToDatabase, COLLECTIONS } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  try {
    const { db } = await connectToDatabase();

    const result = await db.collection(COLLECTIONS.contact).insertOne({
      name,
      email,
      subject: subject || '',
      message,
      status: 'new',
      createdAt: new Date(),
    });

    return res.status(201).json({
      ok: true,
      id: result.insertedId.toString(),
      message: 'Message received. We will be in touch shortly.',
    });
  } catch (err) {
    console.error('[contact]', err);
    return res.status(500).json({ error: 'Could not send your message. Please try again.' });
  }
}
