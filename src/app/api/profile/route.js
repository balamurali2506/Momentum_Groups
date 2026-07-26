import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Enrollment from '@/lib/models/Enrollment';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get learning stats
    const enrollments = await Enrollment.find({ userId: user._id });
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completed).length;
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
    const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt
      },
      stats: {
        totalCourses,
        completedCourses,
        averageProgress,
        certificatesEarned: completedCourses
      }
    });
  } catch (err) {
    console.error('Profile API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name },
      { new: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}