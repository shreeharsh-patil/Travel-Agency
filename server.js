import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { routes } from './lib/router.js';
import { rateLimit } from './lib/rateLimit.js';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    const { connectToDatabase } = await import('./lib/db.js');
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    res.json({ status: 'ok', database: 'mongodb', integrations: { weather: 'Open-Meteo', currency: 'Frankfurter', flightTracking: 'OpenSky (optional)' } });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

for (const { method, path, handler } of routes) {
  // Rate-limit mutating routes to guard against brute force / abuse.
  const isMutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
  const isAuth = path.startsWith('/api/auth/');
  const wrapped = isMutating ? rateLimit({ windowMs: 60_000, max: isAuth ? 10 : 120 })(handler) : handler;

  app[method.toLowerCase()](path, async (req, res) => {
    try {
      await wrapped(req, res);
    } catch (err) {
      console.error(`[api] ${method} ${path} failed:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
}

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🌐 Horizon Travels API running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[api] Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[api] Server error:', err);
    }
  });
}

// Default to 3002 to match the Vite dev proxy (see vite.config.js).
const initialPort = parseInt(process.env.PORT || '3002', 10);
startServer(initialPort);
