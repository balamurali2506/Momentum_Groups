import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    totalHours: { type: Number, default: 0 }, // Added
    currentStreak: { type: Number, default: 0 }, // Added
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);