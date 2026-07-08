import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  // Auth guard — must be a logged-in admin
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Sanitize folder name to prevent path traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'misc'

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase();

    // Whitelist allowed extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.mp4', '.webm', '.mov', '.avi']
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Generate unique filename to prevent overwriting
    const uniqueFilename = `${crypto.randomUUID()}${extension}`;

    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);

    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save the file
    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFolder}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: originalName,
      fileType: file.type,
      size: file.size
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error during file upload' }, { status: 500 });
  }
}
