import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The anon key may INSERT into public.leads but has no SELECT policy, so
 * `insert().select()` under it fails with 42501 and the lead is lost — that
 * silently dropped a month of sign-ups. Writes must go through the
 * service-role client instead. These mocks make the anon client reject any
 * `.select()` after an insert, exactly like RLS does.
 */
const anonInserts: unknown[] = [];
const adminInserts: unknown[] = [];
const adminUpdates: unknown[] = [];
let adminAvailable = true;
let adminInsertError: { code?: string; message: string } | null = null;

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    from: () => ({
      insert: (row: unknown) => {
        anonInserts.push(row);
        return {
          // Mirrors RLS: the row goes in, but reading it back is denied.
          select: () => ({
            single: async () => ({ data: null, error: { code: "42501", message: "rls" } }),
          }),
          then: (resolve: (v: { error: null }) => unknown) => resolve({ error: null }),
        };
      },
    }),
  },
}));

vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: () =>
    adminAvailable
      ? {
          from: () => ({
            insert: (row: unknown) => {
              adminInserts.push(row);
              return {
                select: () => ({
                  single: async () =>
                    adminInsertError
                      ? { data: null, error: adminInsertError }
                      : { data: { id: "lead-1" }, error: null },
                }),
              };
            },
            update: (patch: unknown) => {
              adminUpdates.push(patch);
              return { eq: async () => ({ error: null }) };
            },
          }),
        }
      : null,
}));

vi.mock("@/lib/resend", () => ({
  resend: {},
  isResendConfigured: () => false,
  FROM_ADDRESS: "",
  REPLY_TO_ADDRESS: "",
}));
vi.mock("@/lib/emails/lead-emails", () => ({ buildWelcomeEmail: () => ({}) }));

import { POST } from "./route";

const post = (body: Record<string, unknown>, ip = "1.2.3.4") =>
  POST(
    new Request("http://x/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }) as any,
  );

const lead = { courseSlug: "s", courseTitle: "T", email: "a@b.com", phone: "1" };

beforeEach(() => {
  anonInserts.length = 0;
  adminInserts.length = 0;
  adminUpdates.length = 0;
  adminAvailable = true;
  adminInsertError = null;
});

describe("POST /api/leads", () => {
  it("saves the lead through the service-role client, not the anon key", async () => {
    const res = await post(lead, "10.0.0.1");

    expect(res.status).toBe(200);
    expect(adminInserts).toHaveLength(1);
    expect(adminInserts[0]).toMatchObject({ course_slug: "s", email: "a@b.com" });
    expect(anonInserts).toHaveLength(0);
  });

  it("still saves the lead when no service-role key is configured", async () => {
    adminAvailable = false;

    const res = await post(lead, "10.0.0.2");

    // The anon key can insert, just not read the row back, so no id and no
    // welcome email — but the lead itself is never dropped.
    expect(res.status).toBe(200);
    expect(anonInserts).toHaveLength(1);
  });

  it("returns a non-2xx status when the insert really fails, so the client queues the lead", async () => {
    adminInsertError = { code: "08006", message: "connection failure" };

    const res = await post(lead, "10.0.0.3");

    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it("retries without the landing-page columns when the migration is not applied", async () => {
    adminInsertError = { code: "PGRST204", message: "column leads.quiz_answers does not exist" };

    const res = await post({ ...lead, quizAnswers: ["ya"], source: "lp:tiktok:v1" }, "10.0.0.4");

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(adminInserts).toHaveLength(2);
    expect(adminInserts[0]).toMatchObject({ quiz_answers: ["ya"] });
    expect(adminInserts[1]).not.toHaveProperty("quiz_answers");
  });
});
