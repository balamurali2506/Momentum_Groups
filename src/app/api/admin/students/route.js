import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Enrollment from '@/lib/models/Enrollment';

const ADMIN_EMAIL = 'momentumgroups2506@gmail.com'; // 🔥 REPLACE

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    
    const students = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(20);

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ userId: student._id });
        return {
          ...student.toObject(),
          courseCount: enrollments.length,
          completedCount: enrollments.filter(e => e.completed).length,
          totalSpent: 0 // Would need payment history to calculate
        };
      })
    );

    return NextResponse.json({ students: studentsWithStats });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}