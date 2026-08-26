import dotenv from 'dotenv';
import { connectToDatabase, COLLECTIONS } from './db.js';
import { galleryData } from '../src/data/galleryData.js';
import { destinations } from '../src/data/destinations.js';

import { hashPassword } from './auth.js';

dotenv.config();

async function seedDatabase() {
  const { db } = await connectToDatabase();
  const galleryColl = db.collection(COLLECTIONS.gallery);
  const placesColl = db.collection(COLLECTIONS.places);
  const usersColl = db.collection(COLLECTIONS.users);

  // Seed Admin Account
  const adminEmail = 'admin@horizontravels.com';
  const adminPasswordHash = await hashPassword('HorizonAdmin2026!');
  await usersColl.updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        name: 'Horizon Administrator',
        role: 'admin',
        phone: '+91 98765 43210',
        emailVerified: true,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  let insertedGallery = 0;
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
    const result = await galleryColl.updateOne({ src: item.src }, { $set: doc }, { upsert: true });
    if (result.upsertedCount > 0) insertedGallery += 1;
  }

  let insertedPlaces = 0;
  for (const dest of destinations) {
    const doc = {
      ...dest,
      status: 'APPROVED',
      amenities: dest.amenities || ['wifi', 'pool', 'ac', 'parking', 'kitchen', 'view'],
      gallery: dest.gallery && dest.gallery.length > 0 ? dest.gallery : [dest.image],
      updated_at: new Date().toISOString()
    };
    const result = await placesColl.updateOne({ slug: dest.slug }, { $set: doc }, { upsert: true });
    if (result.upsertedCount > 0) insertedPlaces += 1;
  }

  const totalPlaces = await placesColl.countDocuments();
  const totalGallery = await galleryColl.countDocuments();
  const totalUsers = await usersColl.countDocuments();

  console.log(`✅ Database successfully seeded:`);
  console.log(`   - Admin: ${adminEmail} (password: HorizonAdmin2026!)`);
  console.log(`   - Users: ${totalUsers} total`);
  console.log(`   - Places: ${insertedPlaces} new, ${totalPlaces} total`);
  console.log(`   - Gallery: ${insertedGallery} new, ${totalGallery} total`);
}


seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  });

