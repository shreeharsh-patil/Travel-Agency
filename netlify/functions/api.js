import { findRoute } from '../../lib/router.js';

function createResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Netlify function — every request to /api/* lands here and is routed
 * to the same handlers used on Vercel and in the local dev server.
 */
export default async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname.startsWith('/api') ? url.pathname : `/api${url.pathname}`;
    const route = findRoute(req.method, path);

    if (!route) {
      return createResponse(404, { error: 'Route not found' });
    }

    // Adapt the Fetch API Request into the (req, res) style used by handlers.
    const headers = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let body = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const text = await req.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = {};
        }
      }
    }

    const vReq = {
      method: req.method,
      headers,
      query: Object.fromEntries(url.searchParams),
      body,
    };

    const vRes = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(key, value) {
        this.headers[key] = value;
        return this;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = JSON.stringify(data);
        this.headers['Content-Type'] = 'application/json';
        return this;
      },
      send(data) {
        this.body = data;
        return this;
      },
    };

    await route.handler(vReq, vRes);

    return new Response(vRes.body || '', {
      status: vRes.statusCode || 200,
      headers: { 'Content-Type': 'application/json', ...vRes.headers },
    });
  } catch (err) {
    console.error('[netlify/api]', err);
    return createResponse(500, { error: 'Internal server error' });
  }
};

export const config = { path: '/api/*' };
