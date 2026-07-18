import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Strips HTML tags for use in <meta> descriptions / OG tags, where raw
// markup from a rich-text field would render as broken/truncated HTML in
// <head>. Server-safe (no DOM dependency), unlike DOMPurify.
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Case-insensitive substring match against any of the given fields, used to
// back admin list search boxes. An empty term matches everything.
export function matchesSearchTerm(term: string, fields: (string | undefined)[]): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => (field || '').toLowerCase().includes(needle));
}

// Resizes + re-encodes an image to WebP client-side, returning a Blob ready
// for upload to Supabase Storage (previously returned a base64 data URI for
// direct inline storage in Postgres — see git history for that version).
export const compressImage = (file: File, maxWidth = 1000): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable"));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to encode image"));
          },
          "image/webp",
          0.7
        );
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

export const uploadToStorage = async (
  supabase: import("@supabase/supabase-js").SupabaseClient,
  blob: Blob,
  path: string
): Promise<string> => {
  const { error } = await supabase.storage
    .from("admin-media")
    .upload(path, blob, { upsert: true, contentType: "image/webp" });
  if (error) throw error;
  const { data } = supabase.storage.from("admin-media").getPublicUrl(path);
  return data.publicUrl;
};

export const removeFromStorage = async (
  supabase: import("@supabase/supabase-js").SupabaseClient,
  publicUrl: string
): Promise<void> => {
  const marker = "/object/public/admin-media/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // not a Storage URL (e.g. leftover base64 or external URL)
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from("admin-media").remove([path]);
};
