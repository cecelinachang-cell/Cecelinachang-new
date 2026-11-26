import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { bundleLandingPages } from "./bundle-landing";
import { landingPages } from "./landing-pages";
import { CLASS_BUNDLES } from "@/lib/bundles";

describe("bundle landing pages", () => {
  const all = Object.entries(bundleLandingPages);

  it("has the Semua Kelas page", () => {
    expect(bundleLandingPages["semua-kelas"]?.bundleKey).toBe("semua");
  });

  it.each(all)("%s points at a real bundle and has three steps", (_slug, copy) => {
    expect(CLASS_BUNDLES.some((b) => b.key === copy.bundleKey)).toBe(true);
    expect(copy.steps).toHaveLength(3);
    expect(copy.faq.length).toBeGreaterThan(0);
  });

  // /lp/[slug] is for classes; a bundle page with a class's slug would never be reached.
  it.each(all)("%s does not reuse a class landing page's address", (slug) => {
    expect(Object.keys(landingPages)).not.toContain(slug);
  });

  // Prices live in lib/bundles.ts and the catalogue, so they can't go stale here.
  it.each(all)("%s types no prices, invented value or urgency into the copy", (_slug, copy) => {
    const text = JSON.stringify(copy).toLowerCase();
    expect(text).not.toMatch(/rp\s?\d/);
    for (const banned of ["senilai", "hari ini saja", "terbatas", "baru saja mendaftar", "anti gagal"]) {
      expect(text, banned).not.toContain(banned);
    }
  });

  it.each(all)("%s has a self-hosted video small enough for a phone, with a poster", (_slug, copy) => {
    if (!copy.previewVideo) return;
    const video = join(process.cwd(), "public", copy.previewVideo.src);
    expect(existsSync(video)).toBe(true);
    expect(statSync(video).size).toBeLessThan(6 * 1024 * 1024);
    expect(existsSync(join(process.cwd(), "public", copy.previewVideo.poster))).toBe(true);
  });
});
