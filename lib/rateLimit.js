/**
 * Lightweight in-memory sliding-window rate limiter.
 * Applied to mutating API routes in the Express dev/prod server (server.js).
 *
 * Note: serverless platforms (Vercel/Netlify functions) have no persistent
 * in-memory state — they rely on platform-level rate limiting. This layer
 * protects the self-hosted Express server from abuse and brute-force attempts.
 */

const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
  return function rateLimitMiddleware(handler) {
    return async function rateLimitedHandler(req, res) {
      const ip =
        (req.headers && req.headers['x-forwarded-for']
          ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
          : null) ||
        req.ip ||
        (req.socket && req.socket.remoteAddress) ||
        'unknown';

      const now = Date.now();
      const bucket = (buckets.get(ip) || []).filter((t) => now - t < windowMs);

      if (bucket.length >= max) {
        return res.status(429).json({
          error: 'Too many requests. Please try again in a minute.',
        });
      }

      bucket.push(now);
      buckets.set(ip, bucket);

      // Prevent unbounded memory growth — sweep idle buckets occasionally.
      if (buckets.size > 10_000) {
        for (const [key, times] of buckets) {
          const alive = times.filter((t) => now - t < windowMs);
          if (alive.length === 0) buckets.delete(key);
        }
      }

      return handler(req, res);
    };
  };
}
