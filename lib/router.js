import reservations from '../api/reservations.js';
import contact from '../api/contact.js';
import images from '../api/images.js';
import signup from '../api/auth/signup.js';
import login from '../api/auth/login.js';
import me from '../api/auth/me.js';
import search from '../api/search.js';
import places from '../api/places.js';
import reviews from '../api/reviews.js';
import favorites from '../api/favorites.js';
import adminStats from '../api/admin/stats.js';

// Free APIs (Open-Meteo Weather, OpenStreetMap Places, Free Attractions, Currency Converter)
import weather from '../api/weather.js';
import externalPlaces from '../api/external-places.js';
import freeAttractions from '../api/free-attractions.js';
import currencyConverter from '../api/currency-converter.js';
import externalImages from '../api/external-images.js';

/**
 * Single source of truth for every API route.
 * Used by local Express dev server (server.js) and serverless environments.
 */
export const routes = [
  { method: 'POST', path: '/api/reservations', handler: reservations },
  { method: 'POST', path: '/api/contact', handler: contact },
  { method: 'GET', path: '/api/images', handler: images },
  { method: 'POST', path: '/api/images', handler: images },
  { method: 'POST', path: '/api/auth/signup', handler: signup },
  { method: 'POST', path: '/api/auth/login', handler: login },
  { method: 'GET', path: '/api/auth/me', handler: me },

  // Places, Reviews, Search, Favorites, Admin
  { method: 'GET', path: '/api/search', handler: search },

  { method: 'GET', path: '/api/places', handler: places },
  { method: 'POST', path: '/api/places', handler: places },
  { method: 'PATCH', path: '/api/places', handler: places },
  { method: 'DELETE', path: '/api/places', handler: places },

  { method: 'GET', path: '/api/reviews', handler: reviews },
  { method: 'POST', path: '/api/reviews', handler: reviews },
  { method: 'PATCH', path: '/api/reviews', handler: reviews },
  { method: 'DELETE', path: '/api/reviews', handler: reviews },

  { method: 'GET', path: '/api/favorites', handler: favorites },
  { method: 'POST', path: '/api/favorites', handler: favorites },
  { method: 'DELETE', path: '/api/favorites', handler: favorites },

  { method: 'GET', path: '/api/admin/stats', handler: adminStats },

  // FREE OPEN APIS (No API Keys required)
  { method: 'GET', path: '/api/weather', handler: weather },
  { method: 'GET', path: '/api/external-places', handler: externalPlaces },
  { method: 'GET', path: '/api/free-attractions', handler: freeAttractions },
  { method: 'GET', path: '/api/currency-converter', handler: currencyConverter },
  { method: 'GET', path: '/api/external-images', handler: externalImages }
];


export function findRoute(method, path) {
  const key = `${String(method || '').toUpperCase()} ${path}`;
  return routes.find((route) => `${route.method} ${route.path}` === key) || null;
}
