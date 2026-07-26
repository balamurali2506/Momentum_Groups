import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import Enrollment from '@/lib/models/Enrollment';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ courseId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10
    });
  } catch (err) {
    console.error('Reviews API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, rating, comment } = await req.json();

    if (!courseId || !rating || !comment) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await connectDB();

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'You must be enrolled to review' }, { status: 403 });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      userId: session.user.id,
      courseId
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You already reviewed this course' }, { status: 400 });
    }

    const review = await Review.create({
      userId: session.user.id,
      courseId,
      rating,
      comment
    });

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error('Create Review Error:', err);
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
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    await connectDB();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Only allow deletion by the review owner or admin
    const ADMIN_EMAIL = 'your.email@gmail.com'; // Replace with your email
    if (review.userId.toString() !== session.user.id && session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete Review Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}