import { Schema, model } from 'mongoose';

const packagePlaceSchema = new Schema(
    {
        slug: String,
        name: String,
        category: String,
        sort: Number
    },
    { _id: false }
);

const packageSchema = new Schema(
    {
        slug: { type: String, required: true, unique: true, trim: true },
        title: { type: String, required: true, trim: true },
        description: String,
        days: { type: Number, default: 7 },
        nights: { type: Number, default: 6 },
        priceInr: { type: Number, required: true },
        style: String,
        difficulty: String,
        accommodation: String,
        activities: { type: [String], default: [] },
        highlights: { type: [String], default: [] },
        image: String,
        availability: String,
        places: { type: [packagePlaceSchema], default: [] },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

packageSchema.index({ 'places.slug': 1 });
packageSchema.index({ active: 1, priceInr: 1 });

export const Package = model('Package', packageSchema);
