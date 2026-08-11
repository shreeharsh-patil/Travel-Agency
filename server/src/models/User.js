import { Schema, model } from 'mongoose';

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        role: { type: String, enum: ['member', 'admin'], default: 'member' }
    },
    { timestamps: true }
);

export const User = model('User', userSchema);
