/**
 * Weather Service Provider
 * Connects to live free Open-Meteo API.
 * Returns current temperature, condition, wind speed, humidity, sunrise, sunset, and forecast.
 */

export class OpenMeteoWeatherProvider {
  async getLiveWeather(city, lat, lon) {
    try {
      let queryUrl = `/api/weather?city=${encodeURIComponent(city || 'goa')}`;
      if (lat && lon) {
        queryUrl += `&lat=${lat}&lon=${lon}`;
      }

      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error('Weather API request failed');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[WeatherProvider] Live weather unavailable:', err);
      return {
        available: false,
        city: city || 'Sanctuary',
        error: 'Weather currently unavailable',
        forecast: []
      };
    }
  }
}

export const WeatherService = new OpenMeteoWeatherProvider();
