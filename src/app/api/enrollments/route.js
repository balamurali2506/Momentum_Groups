import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';

// 🔥 1. GET Method: Fetch user's enrolled courses
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all enrollments for this user and populate the course details
    const enrollments = await Enrollment.find({ userId: session.user.id })
      .populate('courseId')
      .sort({ purchasedAt: -1 });

    return NextResponse.json({ enrollments });
  } catch (err) {
    console.error('Get Enrollments Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// 🔥 2. POST Method: Create a new enrollment after payment
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    await connectDB();

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      userId: session.user.id,
      courseId
    });

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    const enrollment = await Enrollment.create({
      userId: session.user.id,
      courseId,
      progress: 0,
      completedVideos: [],
      purchasedAt: new Date(),
      paymentStatus: 'completed'
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (err) {
    console.error('Enrollment Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}