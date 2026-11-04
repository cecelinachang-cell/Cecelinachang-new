import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdminRequest } from '@/lib/adminSession';

export const runtime = 'nodejs';

const ALLOWED_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/avif'];

// Issues upload tokens for lib/adminStorage.ts. Token requests need an admin
// session; Blob's "upload completed" callback carries no cookie and is
// verified by handleUpload through its own signature instead.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  if (body.type === 'blob.generate-client-token' && !(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: 10 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { url } = ((await request.json().catch(() => ({}))) as { url?: string }) || {};
  try {
    if (!url || !new URL(url).hostname.endsWith('.public.blob.vercel-storage.com')) {
      return NextResponse.json({ error: 'Not a Blob URL' }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed' }, { status: 500 });
  }
}
