import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate reviews (one review per user per course)
ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);