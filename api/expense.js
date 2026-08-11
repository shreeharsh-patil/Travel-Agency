/**
 * Free Trip Expense Estimator API (Indian Rupees).
 * Provides an estimated per-person budget breakdown (flights, stay, food,
 * local transport, activities) for popular destinations — configurable by
 * number of days and travellers.
 */

const EXPENSE_DATA = {
  goa: {
    currency: 'INR',
    flights: 7500,
    stayPerNight: 6500,
    foodPerDay: 1800,
    transportPerDay: 1200,
    activitiesPerDay: 1500,
    suggestedDays: 4
  },
  'taj-mahal': {
    currency: 'INR',
    flights: 6500,
    stayPerNight: 6000,
    foodPerDay: 1500,
    transportPerDay: 1500,
    activitiesPerDay: 1200,
    suggestedDays: 2
  },
  agra: {
    currency: 'INR',
    flights: 6500,
    stayPerNight: 6000,
    foodPerDay: 1500,
    transportPerDay: 1500,
    activitiesPerDay: 1200,
    suggestedDays: 2
  },
  jaipur: {
    currency: 'INR',
    flights: 8000,
    stayPerNight: 7000,
    foodPerDay: 1700,
    transportPerDay: 1600,
    activitiesPerDay: 2000,
    suggestedDays: 3
  },
  kerala: {
    currency: 'INR',
    flights: 8500,
    stayPerNight: 7200,
    foodPerDay: 1600,
    transportPerDay: 1400,
    activitiesPerDay: 1500,
    suggestedDays: 5
  },
  ladakh: {
    currency: 'INR',
    flights: 12000,
    stayPerNight: 6500,
    foodPerDay: 1800,
    transportPerDay: 3000,
    activitiesPerDay: 2200,
    suggestedDays: 6
  },
  udaipur: {
    currency: 'INR',
    flights: 9000,
    stayPerNight: 8500,
    foodPerDay: 1700,
    transportPerDay: 1500,
    activitiesPerDay: 1800,
    suggestedDays: 3
  },
  mumbai: {
    currency: 'INR',
    flights: 6000,
    stayPerNight: 8000,
    foodPerDay: 2200,
    transportPerDay: 1500,
    activitiesPerDay: 1500,
    suggestedDays: 3
  },
  delhi: {
    currency: 'INR',
    flights: 5500,
    stayPerNight: 7000,
    foodPerDay: 2000,
    transportPerDay: 1200,
    activitiesPerDay: 1200,
    suggestedDays: 3
  },
  varanasi: {
    currency: 'INR',
    flights: 8000,
    stayPerNight: 4500,
    foodPerDay: 1300,
    transportPerDay: 1000,
    activitiesPerDay: 1000,
    suggestedDays: 3
  },
  'andaman-islands': {
    currency: 'INR',
    flights: 14000,
    stayPerNight: 7000,
    foodPerDay: 2000,
    transportPerDay: 2500,
    activitiesPerDay: 2000,
    suggestedDays: 5
  },
  default: {
    currency: 'INR',
    flights: 8000,
    stayPerNight: 6500,
    foodPerDay: 1600,
    transportPerDay: 1300,
    activitiesPerDay: 1400,
    suggestedDays: 4
  }
};

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination = 'goa', days, travellers = 1 } = req.query || {};
  const key = String(destination).toLowerCase().trim().replace(/\s+/g, '-');
  const data = EXPENSE_DATA[key] || EXPENSE_DATA.default;

  const nights = Math.max(1, Math.min(30, parseInt(days, 10) || data.suggestedDays));
  const people = Math.max(1, Math.min(10, parseInt(travellers, 10) || 1));

  const flights = data.flights * people;
  const stay = data.stayPerNight * nights * people;
  const food = data.foodPerDay * nights * people;
  const transport = data.transportPerDay * nights * people;
  const activities = data.activitiesPerDay * nights * people;
  const total = flights + stay + food + transport + activities;
  const perPerson = Math.round(total / people);

  return res.status(200).json({
    success: true,
    destination: key,
    currency: 'INR',
    days: nights,
    travellers: people,
    breakdown: {
      flights: { amount: flights, note: `${formatINR(data.flights)} per person (return)` },
      stay: { amount: stay, note: `${formatINR(data.stayPerNight)} per night per person` },
      food: { amount: food, note: `${formatINR(data.foodPerDay)} per day per person` },
      localTransport: { amount: transport, note: `${formatINR(data.transportPerDay)} per day per person` },
      activities: { amount: activities, note: `${formatINR(data.activitiesPerDay)} per day per person` }
    },
    total: total,
    totalFormatted: formatINR(total),
    perPerson: perPerson,
    perPersonFormatted: formatINR(perPerson),
    disclaimer: 'Estimates are indicative, based on premium/4-star comfort levels, and may vary by season.',
    source: 'Horizon Travels Expense Estimator (INR)'
  });
}
