import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';
import crypto from 'crypto';
import { sendReceiptEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await connectDB();

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      userId: session.user.id,
      courseId
    });

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: session.user.id,
      courseId,
      progress: 0,
      completedVideos: [],
      purchasedAt: new Date(),
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    // Create enrollment
    // 🔥 TRIGGER RECEIPT EMAIL
    // We need to fetch course details to get the title and price
    const Course = (await import('@/lib/models/Course')).default;
    const course = await Course.findById(courseId);
    
    if (course && session.user.email) {
      await sendReceiptEmail(
        session.user.email, 
        session.user.name || 'Student', 
        course.title, 
        course.price
      );
    }

    return NextResponse.json({ success: true, enrollment });
  } catch (err) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}