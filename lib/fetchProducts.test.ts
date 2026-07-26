import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchProducts } from "./fetchProducts";

describe("fetchProducts", () => {
  it("resolves with fallback data when the query hangs past the timeout", async () => {
    const neverResolvingQuery = () =>
      new Promise<{ data: null; error: null }>(() => {}); // simulates a locked/hung supabase call
    const fallback = [{ id: "fallback-1", name: "Fallback Item", price: "Rp 1", imageUrl: "" }];

    const result = await fetchProducts({
      isConfigured: true,
      query: neverResolvingQuery,
      fallback,
      timeoutMs: 50,
    });

    expect(result).toEqual(fallback);
  });

  it("resolves with real data when the query is merely slow, using the default timeout", async () => {
    vi.useFakeTimers();
    try {
      const realData = [{ id: "real-1", name: "Real Item", price: "Rp 2", imageUrl: "" }];
      const slowQuery = () =>
        new Promise<{ data: typeof realData; error: null }>((resolve) => {
          setTimeout(() => resolve({ data: realData, error: null }), 15000);
        });
      const fallback = [{ id: "fallback-1", name: "Fallback Item", price: "Rp 1", imageUrl: "" }];

      const promise = fetchProducts({
        isConfigured: true,
        query: slowQuery,
        fallback,
      });

      await vi.advanceTimersByTimeAsync(15000);
      const result = await promise;

      expect(result).toEqual(realData);
    } finally {
      vi.useRealTimers();
    }
  });

  describe("error logging", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("logs the error when the query rejects", async () => {
      const boom = new Error("network down");
      const failingQuery = () => Promise.reject(boom);
      const fallback = [{ id: "fallback-1", name: "Fallback Item", price: "Rp 1", imageUrl: "" }];

      const result = await fetchProducts({
        isConfigured: true,
        query: failingQuery,
        fallback,
      });

      expect(result).toEqual(fallback);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("failed"),
        boom,
      );
    });
  });
});
