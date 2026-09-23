import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingFaq } from "./LandingFaq";

describe("LandingFaq", () => {
  it("renders nothing when there are no questions, rather than an empty box under a heading", () => {
    expect(renderToStaticMarkup(<LandingFaq items={[]} title="Masih ragu?" />)).toBe("");
  });

  it("renders each question with its answer", () => {
    const html = renderToStaticMarkup(
      <LandingFaq items={[{ question: "Saya pemula, bisa ikut?", answer: "Bisa." }]} title="Masih ragu?" />,
    );
    expect(html).toContain("Masih ragu?");
    expect(html).toContain("Saya pemula, bisa ikut?");
    expect(html).toContain("Bisa.");
  });
});
