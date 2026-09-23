import { describe, it, expect } from "vitest";
import { AGE_RANGES, isMissingColumnError, sanitizeAgeRange, sanitizeQuizAnswers, sanitizeSource } from "./leadFields";

describe("sanitizeQuizAnswers", () => {
  it("keeps up to 10 strings of up to 200 chars", () => {
    const answers = Array.from({ length: 12 }, (_, i) => `${i}`.padEnd(300, "x"));
    const out = sanitizeQuizAnswers(answers)!;
    expect(out).toHaveLength(10);
    expect(out.every((a) => a.length === 200)).toBe(true);
  });

  it("drops non-strings and blanks", () => {
    expect(sanitizeQuizAnswers(["a: Ya", 3, null, " ", { x: 1 }, "b: Tidak"])).toEqual(["a: Ya", "b: Tidak"]);
  });

  it("returns null for non-arrays and empty results", () => {
    expect(sanitizeQuizAnswers("a")).toBeNull();
    expect(sanitizeQuizAnswers(undefined)).toBeNull();
    expect(sanitizeQuizAnswers([])).toBeNull();
    expect(sanitizeQuizAnswers([1, 2])).toBeNull();
  });
});

describe("sanitizeSource", () => {
  it("caps at 120 chars", () => {
    expect(sanitizeSource("s".repeat(200))).toHaveLength(120);
  });

  it("returns null for non-strings and blanks", () => {
    expect(sanitizeSource(undefined)).toBeNull();
    expect(sanitizeSource(42)).toBeNull();
    expect(sanitizeSource("  ")).toBeNull();
  });

  it("keeps a normal source", () => {
    expect(sanitizeSource("lp:tiktok:test1")).toBe("lp:tiktok:test1");
  });
});

describe("isMissingColumnError", () => {
  it("matches PostgREST's schema-cache error and Postgres' undefined column", () => {
    expect(isMissingColumnError({ code: "PGRST204", message: "Could not find the 'source' column" })).toBe(true);
    expect(isMissingColumnError({ code: "42703", message: 'column "quiz_answers" does not exist' })).toBe(true);
  });

  it("does not match other failures such as RLS", () => {
    expect(isMissingColumnError({ code: "42501", message: "new row violates row-level security policy" })).toBe(false);
    expect(isMissingColumnError(null)).toBe(false);
  });
});

describe('sanitizeAgeRange', () => {
  it('keeps only the ranges the form offers', () => {
    for (const range of AGE_RANGES) expect(sanitizeAgeRange(range)).toBe(range);
    expect(sanitizeAgeRange('  35–44 ')).toBe('35–44');
  });

  it('drops anything else', () => {
    for (const value of ['42', '', null, undefined, 35, 'DROP TABLE', '35-44x']) {
      expect(sanitizeAgeRange(value)).toBeNull();
    }
  });
});
