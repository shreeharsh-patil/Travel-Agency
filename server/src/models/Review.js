import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
    {
        place: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: String,
        body: String,
        images: { type: [String], default: [] }
    },
    { timestamps: true }
);

reviewSchema.index({ place: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

export const Review = model('Review', reviewSchema);
