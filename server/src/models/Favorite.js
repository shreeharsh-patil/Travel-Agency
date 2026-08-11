import { Schema, model } from 'mongoose';

const favoriteSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        place: { type: Schema.Types.ObjectId, ref: 'Place', required: true }
    },
    { timestamps: true }
);

favoriteSchema.index({ user: 1, place: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export const Favorite = model('Favorite', favoriteSchema);
