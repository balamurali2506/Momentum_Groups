import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'newest';

    await connectDB();

    // Build filter query
    const query = {};

    // Text search (title, description, tutorName)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tutorName: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'popular':
        sortObj = { enrollmentCount: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const courses = await Course.find(query).sort(sortObj);

    return NextResponse.json({ 
      courses,
      count: courses.length 
    });
  } catch (err) {
    console.error('Search API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}