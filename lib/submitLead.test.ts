import { describe, it, expect } from "vitest";
import { buildLeadSource, buildWhatsAppMessage } from "./submitLead";

const base = {
  courseSlug: "bakso-sapi-premium",
  courseTitle: "Kelas Bakso Sapi Premium",
  coursePrice: "Rp 299.000",
  email: "a@b.com",
  phone: "0812",
  city: "",
  tiktokHandle: "",
};

describe("buildWhatsAppMessage", () => {
  it("keeps the original modal message when there are no quiz answers", () => {
    const msg = buildWhatsAppMessage(base);
    expect(msg).toContain("saya ingin daftar kursus: Kelas Bakso Sapi Premium\n- Harga: Rp 299.000");
    expect(msg).toContain("- Asal Kota: -");
    expect(msg).not.toContain("Kendala saya");
    expect(msg).not.toContain("Umur");
  });

  it("adds an 'Umur' line under the city when an age range is given", () => {
    const msg = buildWhatsAppMessage({ ...base, city: "Medan", ageRange: "35–44" });
    expect(msg).toContain("- Asal Kota: Medan\n- Umur: 35–44\n- User TikTok: -");
  });

  it("adds a 'Kendala saya' line listing the pains", () => {
    const msg = buildWhatsAppMessage({
      ...base,
      pains: ["bakso sering keras, lembek, atau pecah", "resep internet hasilnya beda-beda"],
    });
    expect(msg).toContain(
      "Kendala saya: bakso sering keras, lembek, atau pecah; resep internet hasilnya beda-beda",
    );
  });

  it("omits the line when the pain list is empty", () => {
    expect(buildWhatsAppMessage({ ...base, pains: [] })).not.toContain("Kendala saya");
  });

  it("drops the digital-class refund line and asks to confirm a slot for an offline class", () => {
    const msg = buildWhatsAppMessage({
      ...base,
      courseTitle: "Kelas Offline Bakso Sapi (Sabtu, 26 Sept 2026)",
      coursePrice: "Rp 5.000.000",
      offline: true,
    });
    expect(msg).toContain("saya ingin daftar kursus: Kelas Offline Bakso Sapi (Sabtu, 26 Sept 2026)\n- Harga: Rp 5.000.000");
    expect(msg).not.toContain("Kelas digital");
    expect(msg).toContain("konfirmasi slot");
  });

  it("keeps the refund line for the online class", () => {
    expect(buildWhatsAppMessage(base)).toContain("Kelas digital: tidak ada refund");
  });
});

describe("buildLeadSource", () => {
  it("encodes utm_source and utm_content", () => {
    expect(buildLeadSource("?utm_source=tiktok&utm_content=test1")).toBe("lp:tiktok:test1");
  });

  it("uses '-' for a missing part", () => {
    expect(buildLeadSource("?utm_content=vid9")).toBe("lp:-:vid9");
    expect(buildLeadSource("?utm_source=ig")).toBe("lp:ig:-");
  });

  it("is plain 'lp' with no UTMs", () => {
    expect(buildLeadSource("")).toBe("lp");
  });

  it("caps each part so the whole value fits the 120-char column limit", () => {
    const long = "x".repeat(500);
    expect(buildLeadSource(`?utm_source=${long}&utm_content=${long}`).length).toBeLessThanOrEqual(120);
  });
});
