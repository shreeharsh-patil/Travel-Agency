import { Schema, model } from 'mongoose';

const contactMessageSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        subject: { type: String, default: '' },
        message: { type: String, required: true, trim: true }
    },
    { timestamps: true }
);

export const ContactMessage = model('ContactMessage', contactMessageSchema);
