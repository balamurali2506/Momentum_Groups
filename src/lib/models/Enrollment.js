import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedVideos: [{ type: String }], 
  lastWatchedVideo: { type: String, default: null }, // 🔥 NEW: Tracks where they left off
  progress: { type: Number, default: 0 }, 
  completed: { type: Boolean, default: false },
  purchasedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);