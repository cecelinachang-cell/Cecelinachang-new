import { describe, it, expect, vi } from "vitest";

const insertResult = { data: null, error: { code: "42501", message: "rls" } };
vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    from: () => ({ insert: () => ({ select: () => ({ single: async () => insertResult }) }) }),
  },
}));
vi.mock("@/lib/resend", () => ({ resend: {}, isResendConfigured: () => false, FROM_ADDRESS: "" }));
vi.mock("@/lib/emails/lead-emails", () => ({ buildWelcomeEmail: () => ({}) }));

import { POST } from "./route";

describe("POST /api/leads", () => {
  it("returns a non-2xx status when the insert fails, so the client queues the lead", async () => {
    const req = new Request("http://x/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify({ courseSlug: "s", courseTitle: "T", email: "a@b.com", phone: "1" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});
