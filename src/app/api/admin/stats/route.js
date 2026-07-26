import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import User from '@/lib/models/User';

// 🔥 REPLACE THIS WITH YOUR ACTUAL EMAIL ADDRESS
const ADMIN_EMAIL = 'momentumgroups2506@gmail.com';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
    }

    await connectDB();

    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEnrollments = await Enrollment.countDocuments();
    
    // Calculate total revenue from all enrollments
    const enrollments = await Enrollment.find().populate('courseId', 'price');
    const totalRevenue = enrollments.reduce((sum, enc) => sum + (enc.courseId?.price || 0), 0);

    return NextResponse.json({
      totalCourses,
      totalStudents,
      totalEnrollments,
      totalRevenue
    });
  } catch (err) {
    console.error('Stats API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}