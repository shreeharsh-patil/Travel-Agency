# Horizon Travels architecture audit

## Canonical runtime

The browser is a Vite/React application and communicates with root `api/`
handlers through `server.js` locally or the Vercel/Netlify dispatch adapters.
MongoDB is the only persistence target. `lib/router.js` is the route registry.

## Audit findings

- A second Mongoose Express application exists under `server/`, while the
  frontend uses the root Node-driver/serverless API. Docker previously
  documented PostgreSQL/PostGIS although neither active API uses PostgreSQL.
- Root login checked `user.password`, while sign-up stores `passwordHash`.
- Long-lived JWTs were stored in localStorage and sent by client code.
- Weather, currency, and OpenSky handlers fabricated values after provider
  failures; OpenSky was also presented as flight-shopping information.
- `/account` included a hard-coded confirmed Goa reservation.
- Existing place/package pricing is curated editorial content, not live hotel
  inventory, and must never be relabelled as live provider data.

## Migration boundary

The legacy `server/` tree needs a deliberate, tested migration before removal.
Do not run both APIs in one deployment. Real hotel and flight shopping require
approved provider credentials and a booking agreement.
