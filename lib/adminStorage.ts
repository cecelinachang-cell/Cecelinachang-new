'use client';

import { upload } from '@vercel/blob/client';

/**
 * Admin image storage on Vercel Blob (replaces the Supabase `admin-media`
 * bucket). The browser uploads straight to Blob with a short-lived token from
 * app/api/admin/upload, which only an admin session can get.
 */
export async function uploadToStorage(blob: Blob, path: string): Promise<string> {
  const result = await upload(path, blob, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
    contentType: blob.type || 'image/webp',
  });
  return result.url;
}

/** Deletes an uploaded image. Ignores URLs that aren't ours (old base64, external links). */
export async function removeFromStorage(publicUrl: string): Promise<void> {
  if (!isBlobUrl(publicUrl)) return;
  await fetch('/api/admin/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: publicUrl }),
  });
}

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}
