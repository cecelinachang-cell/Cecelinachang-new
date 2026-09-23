import { describe, expect, it } from "vitest";
import { fallbackThumbnail, thumbnailUrl } from "./youtubeThumbnail";

describe("thumbnailUrl", () => {
  it("starts with the largest size", () => {
    expect(thumbnailUrl("abc")).toBe("https://i.ytimg.com/vi/abc/maxresdefault.jpg");
  });
});

describe("fallbackThumbnail", () => {
  it("steps down a size when YouTube serves its 120px 'missing' placeholder", () => {
    expect(fallbackThumbnail("https://i.ytimg.com/vi/abc/maxresdefault.jpg", 120)).toBe(
      "https://i.ytimg.com/vi/abc/sddefault.jpg",
    );
    expect(fallbackThumbnail("https://i.ytimg.com/vi/abc/sddefault.jpg", 120)).toBe(
      "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    );
  });

  it("steps down a size when the image fails to load (no width)", () => {
    expect(fallbackThumbnail("https://i.ytimg.com/vi/abc/maxresdefault.jpg", 0)).toBe(
      "https://i.ytimg.com/vi/abc/sddefault.jpg",
    );
  });

  it("keeps a real thumbnail, and stops after the smallest size", () => {
    expect(fallbackThumbnail("https://i.ytimg.com/vi/abc/maxresdefault.jpg", 1280)).toBeNull();
    expect(fallbackThumbnail("https://i.ytimg.com/vi/abc/hqdefault.jpg", 120)).toBeNull();
  });
});
