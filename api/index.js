import { findRoute } from '../lib/router.js';

/**
 * The only Vercel serverless function. `vercel.json` rewrites every API URL
 * here, keeping Hobby deployments below the function-count limit.
 */
export default async function handler(req, res) {
  const rewrittenPath = req.query?.path;
  const pathPart = Array.isArray(rewrittenPath) ? rewrittenPath.join('/') : rewrittenPath;
  const path = pathPart ? `/api/${String(pathPart).replace(/^\/+/, '')}` : '/api';
  const route = findRoute(req.method, path);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  try {
    await route.handler(req, res);
  } catch (error) {
    console.error(`[api] ${req.method} ${path} failed:`, error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
}
