import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId, videoTitle } = await req.json();
    await connectDB();

    await Enrollment.findOneAndUpdate(
      { userId: user._id, courseId },
      { $set: { lastWatchedVideo: videoTitle } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}