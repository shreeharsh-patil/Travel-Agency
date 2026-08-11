/**
 * Places & Destinations Service Provider
 * Abstracts place search, place details, nearby places, and user submissions.
 * Prioritizes free open geographic data (OpenStreetMap + PostGIS / Database + Wikimedia API).
 */

export class OpenStreetMapPlaceProvider {
  async searchPlaces(query) {
    if (!query || !query.trim()) {
      return { places: [], total: 0 };
    }

    try {
      const [res, extRes] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(query)}`),
        fetch(`/api/external-places?q=${encodeURIComponent(query)}`)
      ]);

      let internalResults = [];
      let externalResults = [];

      if (res.ok) {
        const data = await res.json();
        internalResults = data.results?.places || [];
      }

      if (extRes.ok) {
        const extData = await extRes.json();
        externalResults = extData.places || [];
      }

      return {
        internal: internalResults,
        external: externalResults,
        total: internalResults.length + externalResults.length
      };
    } catch (err) {
      console.error('[PlaceProvider] Search error:', err);
      return { internal: [], external: [], total: 0 };
    }
  }

  async getPlaceDetails(slug) {
    if (!slug) return null;
    try {
      const res = await fetch(`/api/places?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.place || null;
    } catch (err) {
      console.error('[PlaceProvider] Place details error:', err);
      return null;
    }
  }

  async suggestUserPlace(placeData) {
    const token = localStorage.getItem('horizon_token');
    if (!token) {
      throw new Error('Authentication required to suggest a place.');
    }

    const res = await fetch('/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(placeData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit place.');
    }
    return data;
  }
}

export const PlacesService = new OpenStreetMapPlaceProvider();
