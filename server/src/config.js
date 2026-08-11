import 'dotenv/config';

export const config = {
    port: Number(process.env.PORT || 4000),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()),
    search: {
        pageSize: Number(process.env.SEARCH_PAGE_SIZE || 20),
        cacheTtlSeconds: Number(process.env.SEARCH_CACHE_TTL_SECONDS || 300)
    },
    tiles: {
        url: process.env.TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: process.env.TILE_ATTRIBUTION || '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    // Self-hosted Nominatim (address geocoding). The public service is never used.
    nominatim: {
        url: process.env.NOMINATIM_URL || 'http://localhost:8080',
        searchPath: process.env.NOMINATIM_SEARCH_PATH || '/search',
        referer: process.env.NOMINATIM_REFERER || 'https://horizontravels.example',
        email: process.env.NOMINATIM_EMAIL || ''
    },
    // Best-effort enrichment from open sources (Wikimedia/Wikipedia). Never invent data.
    enrichment: {
        enabled: process.env.ENRICHMENT_ENABLED === '1',
        userAgent: process.env.ENRICHMENT_USER_AGENT || 'HorizonTravels/1.0 (https://horizontravels.example)',
        timeoutMs: Number(process.env.ENRICHMENT_TIMEOUT_MS || 4000)
    }
};
