import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // <-- THIS FORCES IT TO READ .env.local

import mongoose from 'mongoose';
import Course from '../lib/models/Course.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is missing in .env.local');
  process.exit(1);
}

const sampleCourses = [
  {
    title: 'Complete Web Development Bootcamp 2026',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch. Build real-world projects and become a full-stack developer.',
    price: 89,
    category: 'Programming',
    tutorName: 'Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    modules: [
      { 
        title: 'Introduction to Web Development', 
        videos: [
          // This is a real YouTube video ID for testing. Replace it with your own Unlisted video ID later!
          { title: 'Welcome to the Course', videoUrl: 'PkZNo7MFNFg', duration: 5 },
          { title: 'How the Internet Works', videoUrl: '', duration: 12 },
          { title: 'Setting Up Your Dev Environment', videoUrl: '', duration: 15 }
        ] 
      },
      { 
        title: 'HTML5 Fundamentals', 
        videos: [
          { title: 'HTML Document Structure', videoUrl: '', duration: 10 },
          { title: 'Working with Text and Links', videoUrl: '', duration: 18 },
          { title: 'Images, Lists, and Tables', videoUrl: '', duration: 22 },
          { title: 'HTML5 Semantic Elements', videoUrl: '', duration: 15 }
        ] 
      },
      { 
        title: 'CSS3 Styling and Layouts', 
        videos: [
          { title: 'CSS Selectors and Specificity', videoUrl: '', duration: 20 },
          { title: 'The Box Model and Display Properties', videoUrl: '', duration: 18 },
          { title: 'Flexbox Mastery', videoUrl: '', duration: 25 },
          { title: 'CSS Grid Layout', videoUrl: '', duration: 28 },
          { title: 'Responsive Design and Media Queries', videoUrl: '', duration: 22 }
        ] 
      },
      { 
        title: 'JavaScript Essentials', 
        videos: [
          { title: 'Variables, Data Types, and Operators', videoUrl: '', duration: 15 },
          { title: 'Control Flow: If Statements and Loops', videoUrl: '', duration: 20 },
          { title: 'Functions and Scope', videoUrl: '', duration: 25 },
          { title: 'Arrays and Objects', videoUrl: '', duration: 22 },
          { title: 'DOM Manipulation and Events', videoUrl: '', duration: 30 }
        ] 
      }
    ]
  },
  {
    title: 'Digital Marketing Masterclass',
    description: 'Master SEO, social media marketing, Google Ads, and content strategy. Grow any business online with proven tactics.',
    price: 59,
    category: 'Marketing',
    tutorName: 'Michael Chen',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    modules: [
      { 
        title: 'SEO Fundamentals', 
        videos: [
          { title: 'How Google Works', videoUrl: '', duration: 12 }, 
          { title: 'Keyword Research', videoUrl: '', duration: 20 }
        ] 
      },
      { 
        title: 'Social Media Strategy', 
        videos: [
          { title: 'Instagram Growth', videoUrl: '', duration: 18 }, 
          { title: 'Content Planning', videoUrl: '', duration: 15 }
        ] 
      }
    ]
  }
];

async function seed() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected! Clearing old data...');
    
    await Course.deleteMany({});
    await Course.insertMany(sampleCourses);
    
    console.log(`🎉 SUCCESS! Seeded ${sampleCourses.length} courses with rich video data.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();