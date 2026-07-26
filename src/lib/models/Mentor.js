import mongoose from 'mongoose';

const MentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    courses: {
      type: Number,
      default: 0,
    },
    students: {
      type: Number,
      default: 0,
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent model overwrite error in Next.js hot reloading
export default mongoose.models.Mentor || mongoose.model('Mentor', MentorSchema);