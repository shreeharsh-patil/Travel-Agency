import dotenv from 'dotenv';
import { connectToDatabase, COLLECTIONS } from './db.js';
import { galleryData } from '../src/data/galleryData.js';

dotenv.config();

async function seedGallery() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.gallery);

  let inserted = 0;
  for (const item of galleryData) {
    const doc = {
      id: item.id,
      src: item.src,
      alt: item.alt,
      category: item.category,
      caption: item.caption,
      sortOrder: item.id,
      createdAt: new Date(),
    };
    const result = await collection.updateOne({ src: item.src }, { $set: doc }, { upsert: true });
    if (result.upsertedCount > 0) {
      inserted += 1;
    } else if (typeof result.upsertedCount === 'undefined' && result.matchedCount === 0) {
      // Local JSON fallback wrapper has no upsert support — insert manually.
      const existing = await collection.findOne({ src: item.src });
      if (!existing) {
        await collection.insertOne(doc);
        inserted += 1;
      }
    }
  }

  const total = await collection.countDocuments();
  console.log(
    `✅ Gallery seeded: ${inserted} new, ${total} total images in "${COLLECTIONS.gallery}".`
  );
}

seedGallery()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    console.error('   Copy .env.example to .env and set MONGODB_URI, then re-run `npm run seed`.');
    process.exit(1);
  });
