import mongoose from 'mongoose';
import { config } from './config.js';

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB. Atlas free tier is a single node (no transactions),
 * so models rely on upserts and unique indexes rather than multi-doc transactions.
 */
export async function connectDb() {
    if (!config.mongodbUri) {
        throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env and add your connection string.');
    }
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected.');
}

export async function disconnectDb() {
    await mongoose.disconnect();
}

export { mongoose };
