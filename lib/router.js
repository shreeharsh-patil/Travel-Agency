import reservations from '../api/reservations.js';
import contact from '../api/contact.js';
import images from '../api/images.js';
import signup from '../api/auth/signup.js';
import login from '../api/auth/login.js';
import me from '../api/auth/me.js';
import logout from '../api/auth/logout.js';
import forgotPassword from '../api/auth/forgot-password.js';
import resetPassword from '../api/auth/reset-password.js';
import profile from '../api/profile.js';
import trips from '../api/trips.js';
import blog from '../api/blog.js';
import newsletter from '../api/newsletter.js';
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
import flights from '../api/flights.js';
import hotelSearch from '../api/hotels.js';
import flightSearch from '../api/flight-search.js';
import directions from '../api/directions.js';
import sunTimes from '../api/sun-times.js';
import countryInfo from '../api/country-info.js';
import wikiSummary from '../api/wiki-summary.js';
import timezone from '../api/timezone.js';
import elevation from '../api/elevation.js';
import airQuality from '../api/air-quality.js';
import photonGeocode from '../api/photon-geocode.js';
import pincode from '../api/pincode.js';
import uvIndex from '../api/uv-index.js';
import marine from '../api/marine.js';
import indianStates from '../api/indian-states.js';
import expense from '../api/expense.js';
import comments from '../api/comments.js';

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
  { method: 'POST', path: '/api/auth/logout', handler: logout },
  { method: 'POST', path: '/api/auth/forgot-password', handler: forgotPassword },
  { method: 'POST', path: '/api/auth/reset-password', handler: resetPassword },
  { method: 'GET', path: '/api/auth/me', handler: me },
  { method: 'PATCH', path: '/api/auth/me', handler: profile },

  // Trips & Itineraries (sync + share + publish)
  { method: 'GET', path: '/api/trips', handler: trips },
  { method: 'POST', path: '/api/trips', handler: trips },
  { method: 'PATCH', path: '/api/trips', handler: trips },
  { method: 'DELETE', path: '/api/trips', handler: trips },

  // Journal / Blog CMS
  { method: 'GET', path: '/api/blog', handler: blog },
  { method: 'POST', path: '/api/blog', handler: blog },
  { method: 'PATCH', path: '/api/blog', handler: blog },
  { method: 'DELETE', path: '/api/blog', handler: blog },

  // Newsletter
  { method: 'GET', path: '/api/newsletter', handler: newsletter },
  { method: 'POST', path: '/api/newsletter', handler: newsletter },

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
  { method: 'GET', path: '/api/external-images', handler: externalImages },
  { method: 'GET', path: '/api/flights', handler: flights },
  { method: 'GET', path: '/api/hotels', handler: hotelSearch },
  { method: 'GET', path: '/api/flight-search', handler: flightSearch },
  { method: 'GET', path: '/api/directions', handler: directions },
  { method: 'GET', path: '/api/sun-times', handler: sunTimes },
  { method: 'GET', path: '/api/country-info', handler: countryInfo },
  { method: 'GET', path: '/api/wiki-summary', handler: wikiSummary },
  { method: 'GET', path: '/api/timezone', handler: timezone },
  { method: 'GET', path: '/api/elevation', handler: elevation },
  { method: 'GET', path: '/api/air-quality', handler: airQuality },
  { method: 'GET', path: '/api/photon-geocode', handler: photonGeocode },
  { method: 'GET', path: '/api/pincode', handler: pincode },
  { method: 'GET', path: '/api/uv-index', handler: uvIndex },
  { method: 'GET', path: '/api/marine', handler: marine },
  { method: 'GET', path: '/api/indian-states', handler: indianStates },
  { method: 'GET', path: '/api/expense', handler: expense },
  { method: 'GET', path: '/api/comments', handler: comments },
  { method: 'POST', path: '/api/comments', handler: comments },
  { method: 'PATCH', path: '/api/comments', handler: comments },
  { method: 'DELETE', path: '/api/comments', handler: comments }
];



export function findRoute(method, path) {
  const key = `${String(method || '').toUpperCase()} ${path}`;
  return routes.find((route) => `${route.method} ${route.path}` === key) || null;
}
