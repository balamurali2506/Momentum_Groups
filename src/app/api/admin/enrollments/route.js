import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';

const ADMIN_EMAIL = 'momentumgroups2506@gmail.com'; // 🔥 REPLACE

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    
    const enrollments = await Enrollment.find()
      .sort({ purchasedAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('courseId', 'title price');

    return NextResponse.json({ enrollments });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}