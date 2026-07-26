import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { 
      status: 401,
      headers: { 'Cache-Control': 'no-store, max-age=0' } // Prevents caching
    });
  }
  return NextResponse.json({ user }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' } // Prevents caching
  });
}