import { describe, expect, it } from "vitest";
import { isValidIndonesianPhone, suggestEmailFix } from "./leadValidation";

describe("isValidIndonesianPhone", () => {
  it("accepts 08, 62 and +62 mobile numbers, with spaces or dashes", () => {
    for (const phone of ["081284250718", "6281284250718", "+62 812-8425-0718", "0812 8425 071"]) {
      expect(isValidIndonesianPhone(phone), phone).toBe(true);
    }
  });

  it("accepts numbers pasted from contacts with brackets or slashes", () => {
    for (const phone of ["(0812) 3456 7890", "+62(812)34567890", "0812/3456/7890"]) {
      expect(isValidIndonesianPhone(phone), phone).toBe(true);
    }
  });

  it("rejects landlines, too-short, too-long and non-numeric input", () => {
    for (const phone of ["0215551234", "08123", "0812842507189999", "abc", "", "+1 415 555 0100"]) {
      expect(isValidIndonesianPhone(phone), phone).toBe(false);
    }
  });
});

describe("suggestEmailFix", () => {
  it("suggests the intended domain for common typos", () => {
    expect(suggestEmailFix("sari@gmial.com")).toBe("sari@gmail.com");
    expect(suggestEmailFix("sari@gmail.co")).toBe("sari@gmail.com");
    expect(suggestEmailFix("Sari@GAMIL.COM")).toBe("Sari@gmail.com");
    expect(suggestEmailFix("budi@yaho.com")).toBe("budi@yahoo.com");
  });

  it("returns null for correct or unknown domains", () => {
    expect(suggestEmailFix("sari@gmail.com")).toBeNull();
    expect(suggestEmailFix("sari@perusahaan.co.id")).toBeNull();
    expect(suggestEmailFix("not-an-email")).toBeNull();
  });
});
