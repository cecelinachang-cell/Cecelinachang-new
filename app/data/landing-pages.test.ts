import { describe, it, expect } from "vitest";
import { landingPages } from "./landing-pages";
import { courses } from "./courses";
import { products } from "./products";

describe("landingPages", () => {
  const entries = Object.entries(landingPages);

  it("has at least one landing page", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s points at a real course and a real product", (slug, copy) => {
    expect(courses.some((c) => c.slug === slug)).toBe(true);
    expect(products.some((p) => p.id === copy.equipment.recommendedProductId)).toBe(true);
  });

  it.each(entries)("%s has a 4-question quiz with at least one pain question", (_slug, copy) => {
    expect(copy.quiz).toHaveLength(4);
    expect(copy.quiz.some((q) => q.pain)).toBe(true);
    // Saved answers are "<label>: Ya|Tidak"; /api/leads caps each at 200 chars.
    expect(copy.quiz.every((q) => q.label.length + 7 <= 200)).toBe(true);
  });
});
