import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get all completed enrollments
    const enrollments = await Enrollment.find({ 
      userId: session.user.id,
      completed: true 
    }).populate('courseId', 'title thumbnail price');

    return NextResponse.json({ certificates: enrollments });
  } catch (err) {
    console.error('Certificates API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}