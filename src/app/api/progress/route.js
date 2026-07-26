import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User'; // 🔥 Added to safely fetch email
import { sendCompletionEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, videoTitle } = await req.json();
    await connectDB();

    // 1. Find the enrollment
    let enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    // 2. Get total videos in the course to calculate progress
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    const totalVideos = course.modules.reduce((sum, module) => sum + (module.videos?.length || 0), 0);

    // 3. Toggle video completion
    const isCompleted = enrollment.completedVideos.includes(videoTitle);
    
    if (isCompleted) {
      enrollment.completedVideos = enrollment.completedVideos.filter(v => v !== videoTitle);
    } else {
      enrollment.completedVideos.push(videoTitle);
    }

    // 4. Recalculate progress percentage
    const newProgress = Math.round((enrollment.completedVideos.length / totalVideos) * 100);
    enrollment.progress = newProgress;
    enrollment.completed = newProgress === 100;

    await enrollment.save();

    // 5. 🔥 Trigger Completion Email (MOVED BEFORE THE RETURN STATEMENT)
    // We only trigger if it just hit 100% on this action to prevent spamming
    if (newProgress === 100 && !isCompleted) {
      const userEmail = user.email || (await User.findById(user._id).select('email')).email;
      const userName = user.name || 'Student';
      
      if (userEmail) {
        await sendCompletionEmail(userEmail, userName, course.title);
      }
    }

    return NextResponse.json({ 
      success: true, 
      progress: newProgress,
      isCompleted: !isCompleted 
    });

  } catch (err) {
    console.error('Progress update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}