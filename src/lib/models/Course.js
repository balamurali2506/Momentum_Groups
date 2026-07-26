import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' },
  category: { type: String, default: 'General' },
  tutorName: { type: String, required: true },
  modules: [{
    title: String,
    videos: [{ title: String, videoUrl: String, duration: Number }]
  }],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);