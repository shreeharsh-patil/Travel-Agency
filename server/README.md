# Horizon Travels — Server (API)

Node/Express + MongoDB (Atlas) API for the Horizon Travels travel guide.

## Setup

1. Install dependencies:

   ```
   cd server
   npm install
   ```

2. Configure environment (see `.env.example`):

   ```
   cp .env.example .env
   ```

   Set `MONGODB_URI` to your MongoDB connection string (Atlas or local).

3. Create indexes (unique slugs, 2dsphere geo indexes):

   ```
   npm run migrate
   ```

4. Create an admin account:

   ```
   npm run create-admin -- you@example.com "Your Name" 'a-strong-password'
   ```

5. Start the API:

   ```
   npm run dev        # http://localhost:4000
   ```

## Importing places from OpenStreetMap

Named POIs are imported from regional OSM extracts or GeoJSON in pure Node —
no osm2pgsql required.

1. Download a regional extract, e.g. from Geofabrik:

   ```
   curl -L -o india.osm.pbf https://download.geofabrik.de/asia/india-latest.osm.pbf
   ```

2. Import:

   ```
   npm run import:osm -- path/to/india.osm.pbf
   ```

   Or import a GeoJSON FeatureCollection of points:

   ```
   npm run import:osm -- path/to/places.geojson
   ```

The importer maps OSM tags to our categories (restaurant, hotel, temple,
beach, museum, park, shopping, airport, …), generates slugs, stores a GeoJSON
point with a 2dsphere index, and upserts by `(osmType, osmId)` so re-running
updates rather than duplicates. PBF import currently covers nodes (points);
way/relation geometry is a future step.

### Tiles

The map frontend uses OpenStreetMap raster tiles by default. For production,
self-host tiles (e.g. with tilemaker) and point `TILE_URL`/`TILE_ATTRIBUTION`
at it to comply with the OSM tile usage policy.

## API surface (summary)

| Method | Path                          | Auth   | Purpose                     |
|--------|-------------------------------|--------|-----------------------------|
| GET    | `/api/health`                 | —      | Liveness + DB ping          |
| POST   | `/api/auth/register`          | —      | Create account              |
| POST   | `/api/auth/login`             | —      | Get JWT                     |
| GET    | `/api/places`                 | —      | Search places (q, near, cat, page) |
| GET    | `/api/places/:slug`           | —      | Place detail + reviews      |
| POST   | `/api/places/:slug/reviews`   | JWT    | Review a place              |
| GET    | `/api/favorites`              | JWT    | My favorites                |
| POST   | `/api/favorites/:slug`        | JWT    | Add favorite                |
| DELETE | `/api/favorites/:slug`        | JWT    | Remove favorite             |
| POST   | `/api/submissions`            | JWT    | Submit a place for review   |
| GET    | `/api/submissions`            | admin  | List submissions            |
| POST   | `/api/submissions/:id/approve`| admin  | Publish submission          |
| POST   | `/api/submissions/:id/reject` | admin  | Reject submission           |
| GET    | `/api/packages`               | —      | List travel packages        |
| GET    | `/api/packages/:slug`         | —      | Package detail              |
| POST   | `/api/bookings`               | —      | Create booking request      |
| GET    | `/api/bookings/mine`          | JWT    | My bookings                 |
