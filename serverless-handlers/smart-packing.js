/**
 * Free Smart Packing Intelligence Engine (Zero API Key Required).
 * Generates bespoke, climate-aware packing checklists tailored to destination,
 * expected weather, trip duration, and luxury activities.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category = 'Beach', days = 4, temp = 28 } = req.query || {};
  const numDays = Math.max(1, Math.min(Number(days) || 4, 30));
  const numTemp = Number(temp) || 28;
  const isBeach = /beach|coastal|island/i.test(category);
  const isAlpine = /ski|mountain|winter|snow/i.test(category);
  const isCultural = /cultural|temple|heritage|city/i.test(category);

  const essentials = [
    { item: 'Valid Passport & Travel Visa / Photo ID', category: 'Documents', required: true },
    { item: 'Universal Travel Adapter (Type C/D/M/A/B)', category: 'Electronics', required: true },
    { item: 'High-Capacity Power Bank & Charging Cables', category: 'Electronics', required: true },
    { item: 'Credit / Forex Cards + Local Cash Reserve', category: 'Finance', required: true }
  ];

  const clothing = [];
  if (isBeach) {
    clothing.push(
      { item: `${numDays + 1}x Breathable Linen Shirts & Polos`, category: 'Wardrobe' },
      { item: '2-3x Designer Swimwear & Beach Wraps', category: 'Wardrobe' },
      { item: 'Polarized UV Sunglasses & Wide-Brim Sun Hat', category: 'Accessories' },
      { item: 'Waterproof Phone Pouch & Dry Bag', category: 'Gear' },
      { item: 'Reef-Safe SPF 50+ Sunscreen & Aloe Vera', category: 'Grooming' }
    );
  } else if (isAlpine || numTemp < 15) {
    clothing.push(
      { item: 'Thermal Base Layers (Merino Wool)', category: 'Wardrobe' },
      { item: 'Insulated Down Jacket & Waterproof Shell', category: 'Wardrobe' },
      { item: 'Thermal Beanie, Neck Gaiter & Touchscreen Gloves', category: 'Accessories' },
      { item: 'Insulated Waterproof Snow / Hiking Boots', category: 'Footwear' },
      { item: 'High-Altitude UV Lip Balm & Rich Moisturizer', category: 'Grooming' }
    );
  } else {
    clothing.push(
      { item: `${numDays + 1}x Smart Casual Evening Attire & Breathable Tops`, category: 'Wardrobe' },
      { item: 'Comfortable Leather Walking Shoes / Sneakers', category: 'Footwear' },
      { item: 'Light Layering Cardigan / Blazer', category: 'Wardrobe' },
      { item: 'Compact Windproof Umbrella', category: 'Accessories' }
    );
  }

  if (isCultural) {
    clothing.push(
      { item: 'Modest Temple Attire (Shoulder & Knee coverings)', category: 'Cultural Etiquette' },
      { item: 'Easy Slip-on Footwear for sacred site entries', category: 'Footwear' }
    );
  }

  return res.status(200).json({
    success: true,
    destinationCategory: category,
    tripDurationDays: numDays,
    totalItems: essentials.length + clothing.length,
    checklist: [...essentials, ...clothing]
  });
}
