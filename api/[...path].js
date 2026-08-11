import { findRoute } from '../lib/router.js';

/**
 * Vercel catch-all serverless function.
 *
 * Every request to /api/* that doesn't match a dedicated api/<name>.js
 * function is routed here and dispatched through the same shared route
 * table (lib/router.js) used by the local Express server and Netlify.
 *
 * The Vercel Node runtime provides Express-style helpers on the request
 * (req.query, req.headers, req.body auto-parsed for JSON), which is exactly
 * the interface every handler in api/ already expects — so this file stays a
 * thin, deterministic pass-through.
 */
export default async function handler(req, res) {
  const path = String(req.url || '').split('?')[0];
  const route = findRoute(req.method, path);

  if (!route) {
    res.status(404).json({ error: 'Route not found' });
    return;
  }

  try {
    await route.handler(req, res);
  } catch (err) {
    console.error(`[api/[...path]] ${req.method} ${path} failed:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
