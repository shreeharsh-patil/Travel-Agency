export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const databaseConfigured = Boolean(process.env.MONGODB_URI);
  const sessionsConfigured = Boolean(process.env.JWT_SECRET);
  const healthy = databaseConfigured && sessionsConfigured;

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    services: {
      database: databaseConfigured ? 'configured' : 'not configured',
      sessions: sessionsConfigured ? 'configured' : 'not configured'
    }
  });
}
