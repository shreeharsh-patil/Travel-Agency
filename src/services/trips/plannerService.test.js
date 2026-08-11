import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { PlannerService } from './plannerService';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({
      place: {
        name: 'Goa',
        title: 'Goa Beach & Luxury Villa Retreat',
        location: 'Baga Beach, Goa',
        priceFrom: 35000,
        thingsToDo: [
          { title: 'Sunset Catamaran Cruise' },
          { title: 'Fontainhas Heritage Walk' }
        ]
      }
    })
  })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('generateItinerary', () => {
  it('builds one itinerary day per requested duration day', async () => {
    const result = await PlannerService.generateItinerary({
      destination: 'goa',
      durationDays: 5,
      travelers: '2 Guests',
      budgetINR: 60000,
      interests: ['Beach', 'Culture']
    });

    expect(result.destination).toBe('Goa');
    expect(result.durationDays).toBe(5);
    expect(result.itineraryDays).toHaveLength(5);
  });

  it('clamps durations to a maximum of 7 days', async () => {
    const result = await PlannerService.generateItinerary({ durationDays: 30 });
    expect(result.durationDays).toBe(7);
    expect(result.itineraryDays).toHaveLength(7);
  });

  it('formats the estimated budget in INR', async () => {
    const result = await PlannerService.generateItinerary({ budgetINR: 60000 });
    expect(result.formattedBudget).toBe('₹60,000');
    expect(result.budgetINR).toBe(60000);
  });

  it('pulls real activities from the place data when available', async () => {
    const result = await PlannerService.generateItinerary({ destination: 'goa' });
    const day1 = result.itineraryDays[0];
    expect(day1.items.some((item) => item.activity === 'Sunset Catamaran Cruise')).toBe(true);
  });

  it('defaults to Goa with 3 days when given no input', async () => {
    const result = await PlannerService.generateItinerary({});
    expect(result.durationDays).toBe(3);
    expect(result.itineraryDays).toHaveLength(3);
  });

  it('still generates an itinerary when the place API fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('api down');
    }));

    const result = await PlannerService.generateItinerary({ destination: 'anywhere', durationDays: 2 });
    expect(result.itineraryDays).toHaveLength(2);
    expect(result.destination).toBe('anywhere');
  });
});
