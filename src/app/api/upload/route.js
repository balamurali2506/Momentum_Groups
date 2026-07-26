import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import path from 'path';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueName = `${Date.now()}-${file.name}`;
    const publicPath = path.join(process.cwd(), 'public', 'uploads', uniqueName);
    
    await writeFile(publicPath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}