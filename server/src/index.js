import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { sweepCache } from './services/cache.js';

import authRoutes from './routes/auth.js';
import placesRoutes from './routes/places.js';
import reviewsRoutes from './routes/reviews.js';
import favoritesRoutes from './routes/favorites.js';
import submissionsRoutes from './routes/submissions.js';
import packagesRoutes from './routes/packages.js';
import bookingsRoutes from './routes/bookings.js';
import geocodeRoutes from './routes/geocode.js';
import contactRoutes from './routes/contact.js';
import galleryRoutes from './routes/gallery.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigins }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

const api = '/api';
app.get(`${api}/health`, async (_req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('not connected');
        await mongoose.connection.db.admin().ping();
        res.json({ status: 'ok', db: 'mongodb', tiles: config.tiles, attribution: '© OpenStreetMap contributors' });
    } catch {
        res.status(503).json({ status: 'error', message: 'Database unavailable' });
    }
});

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/places`, placesRoutes);
app.use(`${api}/reviews`, reviewsRoutes);
app.use(`${api}/favorites`, favoritesRoutes);
app.use(`${api}/submissions`, submissionsRoutes);
app.use(`${api}/packages`, packagesRoutes);
app.use(`${api}/bookings`, bookingsRoutes);
app.use(`${api}/geocode`, geocodeRoutes);
app.use(`${api}/contact`, contactRoutes);
app.use(`${api}/images`, galleryRoutes);

// 404 for unknown API routes
app.use(`${api}`, (_req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler — never leak raw errors to clients.
app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

// Periodic cache sweep (in-memory)
setInterval(() => { sweepCache().catch(() => {}); }, 60_000).unref();

let server;

async function start() {
    await connectDb();
    server = app.listen(config.port, () => {
        console.log(`Horizon Travels API listening on http://localhost:${config.port}`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});

async function shutdown() {
    if (server) server.close();
    await disconnectDb();
    process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
