import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/analytics", () => ({ trackConversion: vi.fn() }));

import { trackConversion } from "@/lib/analytics";
import { submitLead } from "./submitLead";

const lead = { courseSlug: "s", courseTitle: "T", email: "a@b.com", phone: "0812", city: "" };

describe("submitLead save path", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("window", { open: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
    });
    // A beacon "succeeds" even when the server rejects the lead; it must not be used.
    vi.stubGlobal("navigator", { sendBeacon: vi.fn(() => true) });
  });

  it("queues the lead when the server rejects it (e.g. 429 rate limit)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    await submitLead(lead);
    expect(JSON.parse(store.pending_leads)).toHaveLength(1);
  });

  it("does not queue when the server accepts it", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })));
    await submitLead(lead);
    expect(store.pending_leads).toBeUndefined();
  });

  it("sends with keepalive so the request survives the WhatsApp handoff", async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await submitLead(lead);
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
  });

  it("reports the course name and its rupiah value to the ad pixels", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })));
    await submitLead({ ...lead, courseTitle: "Kelas Offline Bakso Sapi", coursePrice: "Rp 5.000.000" });
    const extra = { contentName: "Kelas Offline Bakso Sapi", contentType: "course", value: 5000000 };
    expect(trackConversion).toHaveBeenCalledWith("lead_form_submit", "s", extra);
    expect(trackConversion).toHaveBeenCalledWith("whatsapp_open", "s", extra);
  });
});
