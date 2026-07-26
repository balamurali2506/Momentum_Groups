import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';

const ADMIN_EMAIL = 'momentumgroups2506@gmail.com'; // Replace with your email

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    
    const courses = await Course.find().sort({ createdAt: -1 });
    
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });
        const completedCount = await Enrollment.countDocuments({ 
          courseId: course._id, 
          completed: true 
        });
        return {
          ...course.toObject(),
          enrollmentCount,
          completedCount,
          completionRate: enrollmentCount > 0 
            ? Math.round((completedCount / enrollmentCount) * 100) 
            : 0
        };
      })
    );

    return NextResponse.json({ courses: coursesWithStats });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const newCourse = await Course.create({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      category: body.category,
      tutorName: body.tutorName,
      thumbnail: body.thumbnail,
      modules: body.modules
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { courseId } = body;
    
    await connectDB();

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title: body.title,
        description: body.description,
        price: Number(body.price),
        category: body.category,
        tutorName: body.tutorName,
        thumbnail: body.thumbnail,
        modules: body.modules
      },
      { new: true }
    );

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('id');

    await connectDB();
    await Course.findByIdAndDelete(courseId);
    await Enrollment.deleteMany({ courseId });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}