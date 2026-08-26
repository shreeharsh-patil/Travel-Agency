import upload from '../serverless-handlers/upload.js';
import reservations from '../serverless-handlers/reservations.js';
import contact from '../serverless-handlers/contact.js';
import images from '../serverless-handlers/images.js';
import signup from '../serverless-handlers/auth/signup.js';
import login from '../serverless-handlers/auth/login.js';
import me from '../serverless-handlers/auth/me.js';
import logout from '../serverless-handlers/auth/logout.js';
import forgotPassword from '../serverless-handlers/auth/forgot-password.js';
import resetPassword from '../serverless-handlers/auth/reset-password.js';
import profile from '../serverless-handlers/profile.js';
import trips from '../serverless-handlers/trips.js';
import blog from '../serverless-handlers/blog.js';
import newsletter from '../serverless-handlers/newsletter.js';
import search from '../serverless-handlers/search.js';
import places from '../serverless-handlers/places.js';
import reviews from '../serverless-handlers/reviews.js';
import favorites from '../serverless-handlers/favorites.js';
import adminStats from '../serverless-handlers/admin/stats.js';

// Free APIs (Open-Meteo Weather, OpenStreetMap Places, Free Attractions, Currency Converter)
import weather from '../serverless-handlers/weather.js';
import externalPlaces from '../serverless-handlers/external-places.js';
import freeAttractions from '../serverless-handlers/free-attractions.js';
import currencyConverter from '../serverless-handlers/currency-converter.js';
import externalImages from '../serverless-handlers/external-images.js';
import flights from '../serverless-handlers/flights.js';
import hotelSearch from '../serverless-handlers/hotels.js';
import flightSearch from '../serverless-handlers/flight-search.js';
import directions from '../serverless-handlers/directions.js';
import sunTimes from '../serverless-handlers/sun-times.js';
import countryInfo from '../serverless-handlers/country-info.js';
import wikiSummary from '../serverless-handlers/wiki-summary.js';
import timezone from '../serverless-handlers/timezone.js';
import elevation from '../serverless-handlers/elevation.js';
import airQuality from '../serverless-handlers/air-quality.js';
import photonGeocode from '../serverless-handlers/photon-geocode.js';
import pincode from '../serverless-handlers/pincode.js';
import uvIndex from '../serverless-handlers/uv-index.js';
import marine from '../serverless-handlers/marine.js';
import indianStates from '../serverless-handlers/indian-states.js';
import expense from '../serverless-handlers/expense.js';
import comments from '../serverless-handlers/comments.js';
import health from '../serverless-handlers/health.js';
import travelAdvisory from '../serverless-handlers/travel-advisory.js';
import nearbyCultural from '../serverless-handlers/nearby-cultural.js';
import smartPacking from '../serverless-handlers/smart-packing.js';
import transitHub from '../serverless-handlers/transit-hub.js';
import festivals from '../serverless-handlers/festivals.js';


/**
 * Single source of truth for every API route.
 * Used by local Express dev server (server.js) and serverless environments.
 */
export const routes = [
  { method: 'GET', path: '/api/health', handler: health },
  { method: 'POST', path: '/api/upload', handler: upload },
  { method: 'GET', path: '/api/reservations', handler: reservations },
  { method: 'POST', path: '/api/reservations', handler: reservations },
  { method: 'DELETE', path: '/api/reservations', handler: reservations },
  { method: 'POST', path: '/api/contact', handler: contact },
  { method: 'GET', path: '/api/images', handler: images },
  { method: 'POST', path: '/api/images', handler: images },
  { method: 'DELETE', path: '/api/images', handler: images },
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
  { method: 'GET', path: '/api/travel-advisory', handler: travelAdvisory },
  { method: 'GET', path: '/api/nearby-cultural', handler: nearbyCultural },
  { method: 'GET', path: '/api/smart-packing', handler: smartPacking },
  { method: 'GET', path: '/api/transit-hub', handler: transitHub },
  { method: 'GET', path: '/api/festivals', handler: festivals },
  { method: 'GET', path: '/api/comments', handler: comments },

  { method: 'POST', path: '/api/comments', handler: comments },
  { method: 'PATCH', path: '/api/comments', handler: comments },
  { method: 'DELETE', path: '/api/comments', handler: comments }
];




export function findRoute(method, path) {
  const key = `${String(method || '').toUpperCase()} ${path}`;
  return routes.find((route) => `${route.method} ${route.path}` === key) || null;
}
