import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate wishlist entries
WishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);