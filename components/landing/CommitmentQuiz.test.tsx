import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CommitmentQuiz } from "./CommitmentQuiz";

const props = {
  courseSlug: "kelas-x",
  courseTitle: "Kelas X",
  coursePrice: "Rp 100.000",
  questions: [{ question: "Pernah gagal?", label: "Pernah gagal", pain: "pernah gagal" }],
  resultNoPain: "-",
  onlineSummary: "Video 20 menit",
};

describe("CommitmentQuiz", () => {
  it("shows only the course's own intro copy, with no promise hard-coded in the component", () => {
    const html = renderToStaticMarkup(<CommitmentQuiz {...props} intro="Jawab 2 pertanyaan. Harga kelasnya Rp 100.000." />);
    expect(html).toContain("Jawab 2 pertanyaan. Harga kelasnya Rp 100.000.");
    expect(html).not.toContain("seumur hidup");
  });

  it("starts on the first question with the step count", () => {
    const html = renderToStaticMarkup(<CommitmentQuiz {...props} intro="-" />);
    expect(html).toContain("Pernah gagal?");
    // No age step any more: the count is the yes/no questions alone.
    expect(html).toContain("1/1");
  });
});
