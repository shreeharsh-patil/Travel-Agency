import { Schema, model } from 'mongoose';

/**
 * Places come from OpenStreetMap (osmType/osmId set) or user submissions.
 * `location` is a GeoJSON point [lon, lat] backed by a 2dsphere index so
 * distance queries use metres.
 */
const placeImageSchema = new Schema(
    {
        url: { type: String, required: true },
        source: String,
        credit: String,
        sort: { type: Number, default: 0 }
    },
    { _id: false }
);

const placeSchema = new Schema(
    {
        osmType: { type: String, enum: ['node', 'way', 'relation'] },
        osmId: { type: Number },
        source: { type: String, enum: ['osm', 'user'], default: 'osm' },
        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, required: true, unique: true, trim: true },
        category: { type: String, index: true },
        categories: { type: [String], default: [] },
        country: String,
        state: String,
        city: String,
        address: String,
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true }
        },
        description: String,
        website: String,
        phone: String,
        openingHours: String,
        wikipedia: String,
        wikidata: String,
        importance: { type: Number, default: 0 },
        images: [placeImageSchema]
    },
    { timestamps: true }
);

placeSchema.index({ location: '2dsphere' });
placeSchema.index({ osmType: 1, osmId: 1 }, { unique: true, sparse: true });
placeSchema.index({ category: 1, importance: -1 });

export const Place = model('Place', placeSchema);
