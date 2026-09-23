import { describe, expect, it } from "vitest";
import { quizIntroText } from "./quizCopy";

const q = (label: string) => ({ question: `${label}?`, label });

describe("quizIntroText", () => {
  it("counts the yes/no questions plus the age step", () => {
    expect(quizIntroText("Jawab {count} pertanyaan singkat.", [q("a"), q("b"), q("c")], "Rp 1")).toBe(
      "Jawab 4 pertanyaan singkat.",
    );
  });

  it("follows the question list when a question is added", () => {
    expect(quizIntroText("Jawab {count} pertanyaan.", [q("a"), q("b"), q("c"), q("d"), q("e")], "Rp 1")).toBe(
      "Jawab 6 pertanyaan.",
    );
  });

  it("fills in the live course price", () => {
    expect(quizIntroText("Harga kelasnya {price}.", [q("a")], "Rp 399.000")).toBe("Harga kelasnya Rp 399.000.");
  });
});
