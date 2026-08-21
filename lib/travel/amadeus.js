let accessToken = null;
let expiresAt = 0;

function configured() {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

async function token() {
  if (!configured()) return null;
  if (accessToken && Date.now() < expiresAt) return accessToken;
  const base = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.AMADEUS_CLIENT_ID, client_secret: process.env.AMADEUS_CLIENT_SECRET });
  const response = await fetch(`${base}/v1/security/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(`Amadeus authentication failed (${response.status})`);
  const data = await response.json();
  accessToken = data.access_token;
  expiresAt = Date.now() + Math.max(0, Number(data.expires_in || 900) - 60) * 1000;
  return accessToken;
}

export async function amadeusGet(path, params) {
  const bearer = await token();
  if (!bearer) return { configured: false, data: null };
  const base = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  const response = await fetch(`${base}${path}?${new URLSearchParams(params)}`, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!response.ok) throw new Error(`Amadeus request failed (${response.status})`);
  return { configured: true, data: await response.json() };
}
