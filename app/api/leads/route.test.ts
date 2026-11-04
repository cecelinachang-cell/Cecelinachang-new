import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The lead route writes to Neon through lib/db's tagged-template client. The
 * mock records each query's SQL text and bound values, and can be told to fail
 * like a dropped connection.
 */
type Call = { text: string; values: unknown[] };
const calls: Call[] = [];
let failWith: Error | null = null;
let configured = true;

vi.mock("@/lib/db", () => ({
  isDbConfigured: () => configured,
  getSql: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join("?"), values });
    if (failWith) throw failWith;
    return strings[0].includes("insert into leads") ? [{ id: "lead-1" }] : [];
  },
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
  calls.length = 0;
  failWith = null;
  configured = true;
});

describe("POST /api/leads", () => {
  it("saves a plain course sign-up", async () => {
    const res = await post(lead, "10.0.0.1");

    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].text).toContain("insert into leads");
    expect(calls[0].values.slice(0, 4)).toEqual(["s", "T", "a@b.com", "1"]);
  });

  it("accepts the exact body lib/submitLead sends, including queued leads replayed after the outage", async () => {
    // Same keys as submitLead's payload (lib/submitLead.ts). Leads queued in
    // visitors' localStorage since 26 Oct 2026 replay with this shape.
    const queued = {
      courseSlug: "bakso-sapi-premium",
      courseTitle: "Kelas Bakso Sapi Premium",
      email: "ani@gmail.com",
      phone: "081234567890",
      city: "",
      tiktokHandle: "",
      website: "",
      quizAnswers: ["Pernah gagal"],
      source: "lp:tiktok:v1",
      name: "Ani",
    };

    const res = await post(queued, "10.0.0.2");

    expect(res.status).toBe(200);
    const values = calls[0].values;
    expect(values).toContain("bakso-sapi-premium");
    expect(values).toContain("Ani");
    expect(values).toContain(JSON.stringify(["Pernah gagal"]));
    expect(values).toContain("lp:tiktok:v1");
  });

  it("returns a non-2xx status when the insert fails, so the client keeps the lead queued", async () => {
    failWith = new Error("connection failure");

    const res = await post(lead, "10.0.0.3");

    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it("returns a non-2xx status when the database isn't configured, so nothing is dropped", async () => {
    configured = false;

    const res = await post(lead, "10.0.0.4");

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(calls).toHaveLength(0);
  });

  it("drops honeypot submissions without touching the database", async () => {
    const res = await post({ ...lead, website: "spam.example" }, "10.0.0.5");

    expect(res.status).toBe(200);
    expect(calls).toHaveLength(0);
  });
});
