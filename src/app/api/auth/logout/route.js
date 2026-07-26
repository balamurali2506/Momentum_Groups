import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const res = NextResponse.json({ success: true });
  
  // Clear the httpOnly cookie from the SERVER side (this actually works!)
  res.headers.set('Set-Cookie', serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expires immediately
    path: '/'
  }));
  
  return res;
}