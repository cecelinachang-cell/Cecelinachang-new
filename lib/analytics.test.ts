import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const pixelCalls: unknown[][] = [];

vi.mock("@/lib/supabase", () => ({
  supabase: { from: () => ({ insert: () => ({ then: (r: () => void) => r() }) }) },
}));

vi.mock("@/lib/pixels", () => ({
  trackPixelEvent: (...args: unknown[]) => {
    pixelCalls.push(args);
  },
}));

import { trackConversion } from "./analytics";

beforeEach(() => {
  pixelCalls.length = 0;
});

describe("trackConversion pixel mapping", () => {
  it("reports a finished landing-page quiz as InitiateCheckout, with the course value", () => {
    // The landing page has no lead_form_open step, so without this the ad
    // platforms see nothing between ViewContent and a completed Lead.
    trackConversion("quiz_complete", "bakso-sapi-premium", {
      contentName: "Kelas Bakso Sapi Premium",
      contentType: "course",
      value: 399000,
    });

    expect(pixelCalls).toEqual([
      [
        "InitiateCheckout",
        {
          contentId: "bakso-sapi-premium",
          contentName: "Kelas Bakso Sapi Premium",
          contentType: "course",
          value: 399000,
        },
      ],
    ]);
  });

  it("keeps quiz_start first-party only", () => {
    trackConversion("quiz_start", "bakso-sapi-premium");

    expect(pixelCalls).toEqual([]);
  });

  it("still maps a submitted lead form to Lead", () => {
    trackConversion("lead_form_submit", "bakso-sapi-premium", { value: 399000 });

    expect(pixelCalls[0]?.[0]).toBe("Lead");
  });
});

describe("pixelsEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const loadFlag = async () => {
    vi.resetModules();
    vi.doUnmock("@/lib/pixels");
    return (await import("./pixels")).pixelsEnabled;
  };

  it("stays off outside a production build, so a dev server never feeds the live pixels", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "1620000000001744");

    expect(await loadFlag()).toBe(false);
  });

  it("can be switched on locally with NEXT_PUBLIC_PIXEL_DEBUG=1", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "1620000000001744");
    vi.stubEnv("NEXT_PUBLIC_PIXEL_DEBUG", "1");

    expect(await loadFlag()).toBe(true);
  });

  it("stays off in production when no pixel ID is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_TIKTOK_PIXEL_ID", "");
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "");

    expect(await loadFlag()).toBe(false);
  });
});
