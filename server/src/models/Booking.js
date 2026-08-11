import { Schema, model } from 'mongoose';

const bookingSchema = new Schema(
    {
        reference: { type: String, required: true, unique: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        package: { type: Schema.Types.ObjectId, ref: 'Package', default: null },
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: String,
        notes: String,
        dates: String,
        travelers: { type: Number, default: 1 },
        addons: { type: [String], default: [] },
        totalInr: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
    },
    { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });

export const Booking = model('Booking', bookingSchema);
