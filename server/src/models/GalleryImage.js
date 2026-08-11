import { Schema, model } from 'mongoose';

const galleryImageSchema = new Schema(
    {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        category: String,
        caption: String,
        sort: { type: Number, default: 0 }
    },
    { timestamps: true }
);

galleryImageSchema.index({ sort: 1, createdAt: 1 });

export const GalleryImage = model('GalleryImage', galleryImageSchema);
