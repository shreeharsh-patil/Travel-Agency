/**
 * Modular Hotel Service Provider Interface.
 * Designed to connect to real hotel search providers when credentials are configured.
 * Does NOT generate fake prices or fake availability when a provider is unconfigured.
 */

export class ModularHotelProvider {
  constructor(apiCredentials = null) {
    this.credentials = apiCredentials;
  }

  async getHotelsByDestination(destinationId) {
    if (!this.credentials) {
      // Gracefully return unsupplied state without displaying fake hotel prices or fake room availability
      return {
        configured: false,
        hotels: [],
        message: `Real hotel provider integration ready for ${destinationId}. Add API credentials to enable live inventory.`
      };
    }

    try {
      // Real API integration logic when credentials exist
      const res = await fetch(`/api/hotels?destination=${destinationId}`);
      if (!res.ok) return { configured: true, hotels: [] };
      const data = await res.json();
      return { configured: true, hotels: data.hotels || [] };
    } catch (err) {
      console.error('[HotelProvider] Fetch error:', err);
      return { configured: true, hotels: [] };
    }
  }
}

export const HotelService = new ModularHotelProvider();
