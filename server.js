import express from 'express';
import dotenv from 'dotenv';
import { routes } from './lib/router.js';
import { rateLimit } from './lib/rateLimit.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '4mb' }));

for (const { method, path, handler } of routes) {
  // Rate-limit mutating routes to guard against brute force / abuse.
  const isMutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
  const wrapped = isMutating ? rateLimit({ windowMs: 60_000, max: 120 })(handler) : handler;

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
