import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';

// 🔥 REPLACE THIS WITH YOUR ACTUAL EMAIL ADDRESS
const ADMIN_EMAIL = 'momentumgroups2506@gmail.com';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be 6+ characters' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // 🔥 Auto-promote to admin if email matches
    const userRole = email === ADMIN_EMAIL ? 'admin' : 'student';

    const user = await User.create({ 
      name, 
      email, 
      password: hashed,
      role: userRole 
    });

    const token = signToken(user);
    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
    setAuthCookie(res, token);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}