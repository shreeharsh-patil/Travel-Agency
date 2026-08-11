/**
 * Activities & Experiences Service Provider.
 * Connects to free attractions endpoint and curated experience categories.
 * Categories: Adventure, Beach, Culture, Food, Wildlife, Wellness, Luxury, Family.
 */

export class ActivityProvider {
  async getActivitiesForDestination(destinationSlug) {
    try {
      const res = await fetch(`/api/free-attractions?destination=${encodeURIComponent(destinationSlug || 'goa')}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.attractions || [];
    } catch (err) {
      console.error('[ActivityProvider] Error fetching activities:', err);
      return [];
    }
  }

  getCategories() {
    return [
      'Adventure',
      'Beach',
      'Culture',
      'Food',
      'Wildlife',
      'Nightlife',
      'Shopping',
      'Wellness',
      'Luxury',
      'Family',
      'Honeymoon',
      'Trekking',
      'Water sports'
    ];
  }
}

export const ActivityService = new ActivityProvider();
