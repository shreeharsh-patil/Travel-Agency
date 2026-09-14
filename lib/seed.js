import dotenv from 'dotenv';
import { connectToDatabase, COLLECTIONS } from './db.js';
import { galleryData } from '../src/data/galleryData.js';
import { destinations } from '../src/data/destinations.js';
import { hashPassword } from './auth.js';

dotenv.config();

async function seedAdmin(usersColl) {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');

  if (!email && !password) return null;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must either both be set or both be omitted.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }
  if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters and contain letters and numbers.');
  }

  await usersColl.updateOne(
    { email },
    {
      $set: {
        email,
        passwordHash: await hashPassword(password),
        role: 'admin',
        emailVerified: true,
        updatedAt: new Date()
      },
      $setOnInsert: {
        name: 'Administrator',
        phone: '',
        avatar: '',
        preferences: {},
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return email;
}

async function seedDatabase() {
  const { db } = await connectToDatabase();
  const galleryColl = db.collection(COLLECTIONS.gallery);
  const placesColl = db.collection(COLLECTIONS.places);
  const usersColl = db.collection(COLLECTIONS.users);

  const seededAdmin = await seedAdmin(usersColl);

  let insertedGallery = 0;
  for (const item of galleryData) {
    const doc = {
      id: item.id,
      src: item.src,
      alt: item.alt,
      category: item.category,
      caption: item.caption,
      sortOrder: item.id,
      createdAt: new Date()
    };
    const result = await galleryColl.updateOne(
      { src: item.src },
      { $set: doc },
      { upsert: true }
    );
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
    const result = await placesColl.updateOne(
      { slug: dest.slug },
      { $set: doc },
      { upsert: true }
    );
    if (result.upsertedCount > 0) insertedPlaces += 1;
  }

  const totalPlaces = await placesColl.countDocuments();
  const totalGallery = await galleryColl.countDocuments();
  const totalUsers = await usersColl.countDocuments();

  console.log('✅ Database successfully seeded:');
  console.log(`   - Admin: ${seededAdmin || 'not configured'}`);
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
