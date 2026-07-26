import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // In a real app, you would query your activity model
    // For now, we'll simulate fetching from a StudyActivity collection
    const today = new Date();
    const activityData = [];
    
    // Generate last 7 days of activity (mock data)
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Simulate hours studied (0-100)
      const hours = Math.floor(Math.random() * 100);
      activityData.push({
        date: date.toISOString().split('T')[0],
        hours
      });
    }

    return NextResponse.json({ activityData });
  } catch (error) {
    console.error('Activity API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}