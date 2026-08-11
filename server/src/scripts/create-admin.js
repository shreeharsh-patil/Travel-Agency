import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { User } from '../models/User.js';
import { hashPassword } from '../middleware/auth.js';

const email = process.argv[2];
const name = process.argv[3];
const password = process.argv[4];

if (!email || !name || !password) {
    console.error('Usage: npm run create-admin -- <email> <name> <password>');
    process.exit(1);
}

async function main() {
    await connectDb();
    const emailNorm = String(email).toLowerCase();
    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
        console.error('A user with this email already exists.');
        process.exit(1);
    }
    const hash = await hashPassword(password);
    const user = await User.create({ email: emailNorm, passwordHash: hash, name, role: 'admin' });
    console.log('Admin created:', { id: user._id, email: user.email, role: user.role });
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
