import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(req, { params }) {
  try {
    // Next.js 15+ requires awaiting params
    const { id } = await params;
    
    await connectDB();
    
    // Fetch the course and convert it to a plain JavaScript object
    const course = await Course.findById(id).lean();
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Return it wrapped in a 'course' object, exactly as the Player expects
    return NextResponse.json({ course });
    
  } catch (err) {
    console.error('Error fetching course:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}