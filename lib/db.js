import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

export const COLLECTIONS = {
  reservations: 'reservations',
  contact: 'contact_messages',
  users: 'users',
  places: 'places',
  reviews: 'reviews',
  favorites: 'favorites',
  gallery: 'gallery_images',
  trips: 'trips',
  blogPosts: 'blog_posts',
  newsletter: 'newsletter_subscribers',
  comments: 'place_comments',
};

// In-Memory / File-backed fallback DB for instant local execution without external DB dependencies
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      places: [
        {
          _id: "place-goa-1",
          id: "goa",
          slug: "goa",
          name: "Goa",
          title: "Goa Beach & Luxury Villa Retreat",
          country: "India",
          state_region: "Goa",
          city: "Panaji",
          description: "Goa is India's coastal paradise — featuring sun-kissed beaches, historic Latin quarters in Fontainhas, clifftop fortresses, and luxury private beachfront villas.",
          category: "Beach",
          price: "₹35,000",
          priceFrom: 35000,
          image: "/images/tropical_beach.png",
          gallery: ["/images/tropical_beach.png", "/images/beach_dinner.png", "/images/hammock.png"],
          location_address: "Baga Beach, North Goa, India",
          website: "https://goa-tourism.com",
          google_maps_url: "https://maps.google.com/?q=Goa",
          status: "APPROVED",
          submitted_by_user_id: "system",
          submitted_by_name: "Horizon Curators",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_by: "admin",
          approved_at: new Date().toISOString(),
          rating: 4.8,
          reviewCount: 142
        },
        {
          _id: "place-kyoto-1",
          id: "kyoto",
          slug: "kyoto",
          name: "Kyoto",
          title: "Kyoto Ancient Zen Stays",
          country: "Japan",
          state_region: "Kansai",
          city: "Kyoto",
          description: "Immerse yourself in the tranquility of ancient temples and bamboo forests. Private tea ceremonies included.",
          category: "Cultural",
          price: "₹2,50,000",
          priceFrom: 250000,
          image: "/images/kyoto.png",
          gallery: ["/images/kyoto.png", "/images/bali_culture.png", "/images/friends.png"],
          location_address: "Gion District, Kyoto, Japan",
          website: "https://kyoto.travel",
          google_maps_url: "https://maps.google.com/?q=Kyoto",
          status: "APPROVED",
          submitted_by_user_id: "system",
          submitted_by_name: "Horizon Curators",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_by: "admin",
          approved_at: new Date().toISOString(),
          rating: 4.9,
          reviewCount: 98
        },
        {
          _id: "place-amalfi-1",
          id: "amalfi",
          slug: "amalfi",
          name: "Amalfi Coast",
          title: "Amalfi Coast Clifftop Villa",
          country: "Italy",
          state_region: "Campania",
          city: "Positano",
          description: "Cliffside luxury overlooking the Tyrrhenian Sea. Private yacht tours and lemon grove tastings.",
          category: "Luxury",
          price: "₹4,20,000",
          priceFrom: 420000,
          image: "/images/amalfi.png",
          gallery: ["/images/amalfi.png", "/images/amalfi_scenic.png", "/images/villa_mansion.png"],
          location_address: "Positano, Amalfi Coast, Italy",
          website: "https://amalfi.it",
          google_maps_url: "https://maps.google.com/?q=Amalfi",
          status: "APPROVED",
          submitted_by_user_id: "system",
          submitted_by_name: "Horizon Curators",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_by: "admin",
          approved_at: new Date().toISOString(),
          rating: 4.95,
          reviewCount: 115
        }
      ],
      reviews: [
        {
          _id: "rev-1",
          place_id: "goa",
          user_id: "usr-demo",
          user_name: "Aarav Sharma",
          user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
          rating: 5,
          title: "Unforgettable Luxury Beach Villa!",
          comment: "The private villa in North Goa was magnificent. Sunset catamaran sailing was the highlight of our trip.",
          images: [],
          verified: true,
          status: "APPROVED",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          _id: "rev-2",
          place_id: "kyoto",
          user_id: "usr-demo2",
          user_name: "Priya Patel",
          user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
          rating: 5,
          title: "Serene & Magical Experience",
          comment: "The private tea ceremony in Gion was incredibly moving. Highly recommended!",
          images: [],
          verified: true,
          status: "APPROVED",
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ],
      favorites: [],
      reservations: [],
      contact_messages: [],
      trips: [],
      blog_posts: [],
      newsletter_subscribers: [],
      place_comments: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function loadLocalDb() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {


    return { users: [], places: [], reviews: [], favorites: [], reservations: [], contact_messages: [], place_comments: [] };
  }
}

function saveLocalDb(data) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

class LocalCollectionWrapper {
  constructor(name) {
    this.name = name;
  }

  async findOne(filter = {}) {
    const dbData = loadLocalDb();
    const items = dbData[this.name] || [];
    return items.find(item => matchesFilter(item, filter)) || null;
  }

  async find(filter = {}) {
    const dbData = loadLocalDb();
    const items = dbData[this.name] || [];
    const matched = items.filter(item => matchesFilter(item, filter));
    return {
      toArray: async () => matched,
      sort: (sortObj) => {
        const sorted = [...matched].sort((a, b) => {
          for (const key of Object.keys(sortObj)) {
            const dir = sortObj[key];
            if (a[key] < b[key]) return dir === 1 ? -1 : 1;
            if (a[key] > b[key]) return dir === 1 ? 1 : -1;
          }
          return 0;
        });
        return { toArray: async () => sorted };
      }
    };
  }

  async insertOne(doc) {
    const dbData = loadLocalDb();
    if (!dbData[this.name]) dbData[this.name] = [];
    const _id = doc._id || `${this.name.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newDoc = { _id, ...doc };
    dbData[this.name].push(newDoc);
    saveLocalDb(dbData);
    return { insertedId: _id, acknowledged: true };
  }

  async updateOne(filter, updateObj) {
    const dbData = loadLocalDb();
    const items = dbData[this.name] || [];
    const index = items.findIndex(item => matchesFilter(item, filter));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };

    const setObj = updateObj.$set || updateObj;
    items[index] = { ...items[index], ...setObj };
    saveLocalDb(dbData);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter) {
    const dbData = loadLocalDb();
    const items = dbData[this.name] || [];
    const index = items.findIndex(item => matchesFilter(item, filter));
    if (index === -1) return { deletedCount: 0 };

    items.splice(index, 1);
    saveLocalDb(dbData);
    return { deletedCount: 1 };
  }

  async deleteMany(filter) {
    const dbData = loadLocalDb();
    const items = dbData[this.name] || [];
    const initialLen = items.length;
    const remaining = items.filter(item => !matchesFilter(item, filter));
    dbData[this.name] = remaining;
    saveLocalDb(dbData);
    return { deletedCount: initialLen - remaining.length };
  }

  async countDocuments(filter = {}) {
    const dbData = loadLocalDb();
    const items = dbData[this.name] || [];
    return items.filter(item => matchesFilter(item, filter)).length;
  }
}

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const key of Object.keys(filter)) {
    const val = filter[key];
    if (key === '$or' && Array.isArray(val)) {
      const passesOr = val.some(subFilter => matchesFilter(item, subFilter));
      if (!passesOr) return false;
    } else if (val && typeof val === 'object' && val.$regex) {
      const reg = new RegExp(val.$regex, val.$options || 'i');
      if (!reg.test(String(item[key] || ''))) return false;
    } else if (val && typeof val === 'object' && val.$in) {
      if (!val.$in.includes(item[key])) return false;
    } else {
      if (item[key] !== val && String(item[key]) !== String(val)) return false;
    }
  }
  return true;
}

class LocalDbWrapper {
  collection(name) {
    return new LocalCollectionWrapper(name);
  }
}

let mongoClientPromise = null;

// Read the URI lazily so that dotenv (loaded by server.js / lib/seed.js)
// has populated process.env by the time the first connection is attempted.
// ESM evaluates imports before the importing module body, so reading env at
// module top-level would always miss .env values.
function getMongoClientPromise() {
  if (mongoClientPromise) return mongoClientPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
    mongoClientPromise = client.connect();
  } catch {


    console.warn('[db] MongoDB client initialization failed, falling back to local DB.');
    mongoClientPromise = null;
  }
  return mongoClientPromise;
}

export async function connectToDatabase() {
  const mongo = getMongoClientPromise();
  if (!mongo) {
    throw new Error('MONGODB_URI is required. Horizon Travels does not use an in-process data fallback.');
  }
  const client = await mongo;
  const db = client.db(process.env.MONGODB_DB || 'horizon_travels');
  return { client, db };
}
