import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    return NextResponse.json({ courses });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}