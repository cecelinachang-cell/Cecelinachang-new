import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHash } from "node:crypto";

// Advanced matching only makes sense when the pixels are actually loaded, and
// pixelsEnabled is computed at import time from the environment.
vi.mock("@/lib/pixels", () => ({ META_PIXEL_ID: "1620000000001744", pixelsEnabled: true }));

import { identifyForPixels, normalizeEmail, normalizePhone, sha256Hex } from "./pixelMatch";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Budi.Santoso@Gmail.COM ")).toBe("budi.santoso@gmail.com");
  });

  it("drops anything that isn't an address, so we don't send a hash of a typo", () => {
    for (const bad of ["", null, undefined, "budi", "budi@gmail", "a b@c.com"]) {
      expect(normalizeEmail(bad)).toBeNull();
    }
  });
});

describe("normalizePhone", () => {
  // Visitors type Indonesian numbers every possible way; the platforms only
  // match on country code first, digits only.
  it.each([
    ["081299990001", "6281299990001"],
    ["0812 9999 0001", "6281299990001"],
    ["+62 812-9999-0001", "6281299990001"],
    ["6281299990001", "6281299990001"],
    ["81299990001", "6281299990001"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it("rejects a half-typed number", () => {
    for (const bad of ["", null, undefined, "0812", "62812"]) {
      expect(normalizePhone(bad)).toBeNull();
    }
  });
});

describe("sha256Hex", () => {
  it("matches a SHA-256 from a separate implementation", async () => {
    expect(await sha256Hex("budi@gmail.com")).toBe(sha("budi@gmail.com"));
  });
});

describe("identifyForPixels", () => {
  const fbq = vi.fn();
  const identify = vi.fn();

  beforeEach(() => {
    fbq.mockClear();
    identify.mockClear();
    vi.stubGlobal("window", { fbq, ttq: { identify } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends hashes, never the raw email or phone", async () => {
    await identifyForPixels({ email: " Budi@Gmail.com ", phone: "0812 9999 0001" });

    const emailHash = sha("budi@gmail.com");
    const phoneHash = sha("6281299990001");
    expect(fbq).toHaveBeenCalledWith("init", "1620000000001744", { em: emailHash, ph: phoneHash });
    expect(identify).toHaveBeenCalledWith({ email: emailHash, phone_number: phoneHash });

    const sent = JSON.stringify([fbq.mock.calls, identify.mock.calls]);
    expect(sent).not.toContain("budi@gmail.com");
    expect(sent).not.toContain("0812");
  });

  it("sends only what it has", async () => {
    await identifyForPixels({ phone: "081299990001" });

    expect(fbq).toHaveBeenCalledWith("init", "1620000000001744", { ph: sha("6281299990001") });
  });

  it("does nothing when there is nothing usable to match on", async () => {
    await identifyForPixels({ email: "not-an-email", phone: "0812" });

    expect(fbq).not.toHaveBeenCalled();
    expect(identify).not.toHaveBeenCalled();
  });

  it("survives a pixel that isn't loaded", async () => {
    vi.stubGlobal("window", {});

    await expect(identifyForPixels({ email: "budi@gmail.com" })).resolves.toBeUndefined();
  });
});
