import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingHero } from "./LandingHero";

const base = {
  hook: "Hook",
  subhook: "Sub",
  proofPoints: [],
  students: 0,
  imageUrl: "/x.jpg",
  courseTitle: "Kelas Bakso Sapi Premium",
  courseSlug: "bakso-sapi-premium",
  price: "Rp 399.000",
  included: ["Video 40 menit"],
  nextStep: "Old one-line next step",
};

describe("LandingHero join steps", () => {
  it("shows numbered steps and the help line instead of the one-liner", () => {
    const html = renderToStaticMarkup(
      <LandingHero {...base} steps={["Bayar", "Tulis Gmail", "Link masuk"]} stepsHelp="Bingung? Tanya Cece" />
    );
    expect(html).toContain("Cara daftar");
    expect(html).toContain("Tulis Gmail");
    expect(html).toContain("Bingung? Tanya Cece");
    expect(html).not.toContain("Old one-line next step");
  });

  it("keeps the one-liner when a page has no steps", () => {
    const html = renderToStaticMarkup(<LandingHero {...base} />);
    expect(html).toContain("Old one-line next step");
    expect(html).not.toContain("Cara daftar");
  });
});
