import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Enrollment from '@/lib/models/Enrollment';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch user's stored stats
    const user = await User.findById(session.user.id).select('totalHours currentStreak');
    
    // Calculate enrollment stats from the database
    const enrolled = await Enrollment.countDocuments({ userId: session.user.id });
    const completed = await Enrollment.countDocuments({ 
      userId: session.user.id, 
      progress: 100 
    });

    return NextResponse.json({
      enrolled: enrolled || 0,
      completed: completed || 0,
      hoursLearned: user?.totalHours || 0,
      currentStreak: user?.currentStreak || 0
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}