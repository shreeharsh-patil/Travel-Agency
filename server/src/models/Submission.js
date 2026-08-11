import { Schema, model } from 'mongoose';

/**
 * User-submitted places.
 * Workflow: PENDING -> (admin review) -> APPROVED | REJECTED
 */
const submissionSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: String,
        category: String,
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true }
        },
        images: { type: [String], default: [] },
        submittedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        reviewNote: String
    },
    { timestamps: true }
);

submissionSchema.index({ status: 1, createdAt: 1 });

export const Submission = model('Submission', submissionSchema);
