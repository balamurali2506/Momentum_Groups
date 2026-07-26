import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/lib/models/Wishlist';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const wishlist = await Wishlist.find({ userId: session.user.id })
      .populate('courseId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ wishlist });
  } catch (err) {
    console.error('Wishlist API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    await connectDB();

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: session.user.id,
      courseId
    });

    if (existing) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 400 });
    }

    const wishlistItem = await Wishlist.create({
      userId: session.user.id,
      courseId
    });

    return NextResponse.json({ success: true, wishlistItem });
  } catch (err) {
    console.error('Add to Wishlist Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    await connectDB();

    await Wishlist.findOneAndDelete({
      userId: session.user.id,
      courseId
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Remove from Wishlist Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}