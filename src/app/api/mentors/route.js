import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/lib/models/Mentor';

export async function GET() {
  try {
    await connectDB();
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    // Always return a valid JSON array, even if empty
    return NextResponse.json({ mentors: mentors || [] });
  } catch (error) {
    console.error('Mentors API Error:', error);
    // Return an empty array instead of crashing the frontend
    return NextResponse.json({ mentors: [] }, { status: 200 }); 
  }
}