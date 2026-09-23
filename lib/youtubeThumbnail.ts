// Largest first. Not every video has maxresdefault; hqdefault always exists.
const SIZES = ["maxresdefault", "sddefault", "hqdefault"] as const;

export function thumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/${SIZES[0]}.jpg`;
}

/**
 * For a thumbnail that failed (width 0) or came back as YouTube's 120px
 * "missing" placeholder (served with a 404), the next smaller size to try.
 * Returns null when the current image is fine or there's nothing smaller.
 */
export function fallbackThumbnail(src: string, naturalWidth: number): string | null {
  if (naturalWidth > 120) return null;
  const index = SIZES.findIndex((size) => src.endsWith(`/${size}.jpg`));
  if (index < 0 || index === SIZES.length - 1) return null;
  return src.replace(`/${SIZES[index]}.jpg`, `/${SIZES[index + 1]}.jpg`);
}
