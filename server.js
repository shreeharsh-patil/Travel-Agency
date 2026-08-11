import express from 'express';
import dotenv from 'dotenv';
import { routes } from './lib/router.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '4mb' }));

for (const { method, path, handler } of routes) {
  app[method.toLowerCase()](path, async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(`[api] ${method} ${path} failed:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 Horizon Travels API running at http://localhost:${PORT}`);
});
