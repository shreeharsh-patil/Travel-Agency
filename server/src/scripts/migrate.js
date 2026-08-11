import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import '../models/User.js';
import '../models/Place.js';
import '../models/Review.js';
import '../models/Favorite.js';
import '../models/Package.js';
import '../models/Booking.js';
import '../models/Submission.js';
import '../models/ContactMessage.js';
import '../models/GalleryImage.js';

/**
 * MongoDB has no schema migrations — this creates/updates the indexes declared
 * on each model (unique slugs, 2dsphere geo indexes, etc.).
 */
async function migrate() {
    await connectDb();
    const models = mongoose.modelNames();
    for (const name of models) {
        await mongoose.model(name).syncIndexes();
        console.log(`Indexes ensured for: ${name}`);
    }
    console.log('Done. Collections:', models.join(', '));
    await mongoose.disconnect();
}

migrate().catch((err) => {
    console.error('Index sync failed:', err.message);
    process.exit(1);
});
