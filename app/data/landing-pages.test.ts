import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { isShortLanding, landingPages, type LandingCopy } from "./landing-pages";
import { courses } from "./courses";
import { products } from "./products";
import { STUDENT_TESTIMONIALS } from "./student-testimonials";

describe("landingPages", () => {
  const all = Object.entries(landingPages);
  // The long page (quiz, equipment, story); short pages are checked below.
  const entries = all.filter((e): e is [string, LandingCopy] => !isShortLanding(e[1]));

  it("has at least one landing page", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("points every testimonial at an image in public/, with a transcript as alt text", () => {
    for (const [, copy] of all) {
      for (const t of copy.testimonials) {
        expect(existsSync(join(process.cwd(), "public", t.src)), t.src).toBe(true);
        expect(t.alt.length).toBeGreaterThan(20);
      }
    }
  });

  it.each(entries)("%s points at a real course and a real product", (slug, copy) => {
    expect(courses.some((c) => c.slug === slug)).toBe(true);
    expect(products.some((p) => p.id === copy.equipment.recommendedProductId)).toBe(true);
  });

  // Kept short on purpose: every question is a tap between an ad visitor and
  // WhatsApp, and the 5-question version got 1 start from ~1,400 visits.
  it.each(entries)("%s has a 2–4 question quiz with at least one pain question", (_slug, copy) => {
    expect(copy.quiz.length).toBeGreaterThanOrEqual(2);
    expect(copy.quiz.length).toBeLessThanOrEqual(4);
    expect(copy.quiz.some((q) => q.pain)).toBe(true);
    // Saved answers are "<label>: Ya|Tidak"; /api/leads caps each at 200 chars.
    expect(copy.quiz.every((q) => q.label.length + 7 <= 200)).toBe(true);
  });

  it.each(entries)("%s lets the quiz intro count its own questions", (_slug, copy) => {
    // A hand-typed number drifts every time a question is added.
    expect(copy.quizIntro).toContain("{count}");
    expect(copy.quizIntro).not.toMatch(/\d+ pertanyaan/);
  });

  it.each(entries)("%s asks an offline-fit question exactly when it offers an offline class", (_slug, copy) => {
    const fitQuestions = copy.quiz.filter((q) => q.offlineFit).length;
    expect(fitQuestions).toBe(copy.offlineClass ? 1 : 0);
    if (copy.offlineClass?.schedule) {
      expect(Number.isNaN(new Date(copy.offlineClass.schedule.startsAt).getTime())).toBe(false);
    }
  });
});

describe("short landing pages", () => {
  const short = Object.entries(landingPages).filter(([, copy]) => isShortLanding(copy));

  it("lapis-legit uses the short page", () => {
    expect(isShortLanding(landingPages["lapis-legit"])).toBe(true);
    expect(isShortLanding(landingPages["bakso-sapi-premium"])).toBe(false);
  });

  it.each(short)("%s has no [CEK] placeholders left", (_slug, copy) => {
    expect(JSON.stringify(copy)).not.toContain("[CEK]");
  });

  it.each(short)("%s points at a real course", (slug) => {
    expect(courses.some((c) => c.slug === slug)).toBe(true);
  });

  it.each(short)("%s only shows its own course's students, from the curated list", (slug, copy) => {
    for (const t of copy.testimonials) {
      const curated = STUDENT_TESTIMONIALS.find((s) => s.image === t.src);
      expect(curated?.courseSlug, t.src).toBe(slug);
    }
  });

  it.each(short)("%s has a self-hosted video small enough for a phone, with a poster", (_slug, copy) => {
    if (!copy.previewVideo) return;
    const video = join(process.cwd(), "public", copy.previewVideo.src);
    expect(existsSync(video)).toBe(true);
    expect(statSync(video).size).toBeLessThan(6 * 1024 * 1024);
    expect(existsSync(join(process.cwd(), "public", copy.previewVideo.poster))).toBe(true);
  });

  // No made-up value stacks or urgency, and the refund line stays in the FAQ.
  it.each(short)("%s has no invented value, urgency or refund line in the copy", (_slug, copy) => {
    const text = JSON.stringify(copy).toLowerCase();
    for (const banned of ["senilai", "hari ini saja", "terbatas", "baru saja mendaftar", "refund", "anti gagal"]) {
      expect(text, banned).not.toContain(banned);
    }
  });
});
