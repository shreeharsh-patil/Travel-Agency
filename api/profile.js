import { connectToDatabase, COLLECTIONS } from '../lib/db.js';
import { authenticateRequest } from '../lib/requestAuth.js';

/**
 * PATCH /api/auth/me — update the signed-in user's profile
 * (name, phone, avatar, travel preferences). Requires a valid JWT.
 */
export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await authenticateRequest(req, res);
  if (!auth) return;
  const { name, phone, avatar, homeCountry, preferredCurrency, preferredLanguage, interests, travelStyle, typicalBudget, dietaryPreferences, accessibilityPreferences, preferences } = req.body || {};
  const update = { updatedAt: new Date() };

  // Blank name/phone are ignored so a stale empty form never wipes a
  // previously saved value; avatar can be cleared explicitly.
  if (name !== undefined && String(name).trim() !== '') update.name = String(name).trim().slice(0, 80);
  if (phone !== undefined && String(phone).trim() !== '') update.phone = String(phone).trim().slice(0, 30);
  if (avatar !== undefined) update.avatar = String(avatar).trim().slice(0, 500);
  const stringFields = { homeCountry, preferredCurrency, preferredLanguage, travelStyle, dietaryPreferences, accessibilityPreferences };
  for (const [key, value] of Object.entries(stringFields)) if (value !== undefined) update[key] = String(value).trim().slice(0, 120);
  const effectiveInterests = interests ?? preferences?.interests;
  if (effectiveInterests !== undefined) update.interests = Array.isArray(effectiveInterests) ? effectiveInterests.map((v) => String(v).trim().slice(0, 40)).filter(Boolean).slice(0, 20) : [];
  if (travelStyle === undefined && preferences?.travelStyle !== undefined) update.travelStyle = String(preferences.travelStyle).trim().slice(0, 120);
  if (typicalBudget === undefined && preferences?.budgetINR !== undefined) update.typicalBudget = Number(preferences.budgetINR) || 0;
  if (typicalBudget !== undefined) {
    const budget = Number(typicalBudget);
    if (!Number.isFinite(budget) || budget < 0 || budget > 10_000_000) return res.status(400).json({ error: 'Typical budget is invalid.' });
    update.typicalBudget = budget;
  }

  const changed = Object.keys(update).filter((k) => k !== 'updatedAt');
  if (changed.length === 0) {
    return res.status(400).json({ error: 'Nothing to update.' });
  }

  try {
    const { db } = await connectToDatabase();
    const idFilter = { _id: auth.user._id };

    const result = await db
      .collection(COLLECTIONS.users)
      .updateOne(idFilter, { $set: update });

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'Account no longer exists.' });
    }

    const user = await db
      .collection(COLLECTIONS.users)
      .findOne(idFilter, { projection: { passwordHash: 0, passwordResetTokenHash: 0 } });

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        homeCountry: user.homeCountry || '', preferredCurrency: user.preferredCurrency || '', preferredLanguage: user.preferredLanguage || '', interests: user.interests || [], travelStyle: user.travelStyle || '', typicalBudget: user.typicalBudget ?? null, dietaryPreferences: user.dietaryPreferences || '', accessibilityPreferences: user.accessibilityPreferences || '',
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[profile]', err);
    return res.status(500).json({ error: 'Could not update your profile.' });
  }
}
