import { POLICIES } from "@/lib/policies";
import { trackConversion } from "@/lib/analytics";

const WHATSAPP_NUMBER = "6281284250718";
const PENDING_LEADS_KEY = "pending_leads";

export interface LeadInput {
  courseSlug: string;
  courseTitle: string;
  coursePrice?: string;
  email: string;
  phone: string;
  city: string;
  /** Optional age range from the landing-page form, e.g. "35–44". */
  ageRange?: string;
  tiktokHandle?: string;
  /** Honeypot: bots fill hidden fields, humans never see them. */
  website?: string;
  /** Every quiz answer, e.g. "Bakso keras/lembek/pecah: Ya". Saved with the lead. */
  quizAnswers?: string[];
  /** The pains the visitor said yes to; become the "Kendala saya" line in WhatsApp. */
  pains?: string[];
  /** Offline (in-person) class: no digital-refund line, and the message asks to confirm a slot. */
  offline?: boolean;
  /** Where the lead came from, e.g. "lp:tiktok:<video-id>" (see buildLeadSource). */
  source?: string;
}

export function buildWhatsAppMessage(input: Omit<LeadInput, "website" | "quizAnswers" | "source">): string {
  const priceLine = input.coursePrice ? `\n- Harga: ${input.coursePrice}` : "";
  const painLine = input.pains?.length ? `\n\nKendala saya: ${input.pains.join("; ")}` : "";
  const closing = input.offline
    ? "\n\nMohon info rekening tujuan transfer dan konfirmasi slot ya Cece, saya siap kirim bukti bayarnya."
    : `\n\n${POLICIES.COURSE_REFUND_SHORT}\nMohon info rekening tujuan transfer ya Cece, saya siap kirim bukti bayarnya.`;
  return `Halo Cece Lina Chang, saya ingin daftar kursus: ${input.courseTitle}${priceLine}\n\nBerikut data diri saya:\n- Email: ${input.email}\n- Nomor WhatsApp: ${input.phone}\n- Asal Kota: ${input.city || "-"}${input.ageRange ? `\n- Umur: ${input.ageRange}` : ""}\n- User TikTok: ${input.tiktokHandle || "-"}${painLine}${closing}`;
}

export function buildWhatsAppUrl(input: Parameters<typeof buildWhatsAppMessage>[0]): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(input))}`;
}

/**
 * Turns a landing page's query string into a lead source like
 * "lp:tiktok:<video-id>", so the admin can see which video produced a sign-up.
 * Each part is capped so the whole value fits the API's 120-char limit.
 */
export function buildLeadSource(search: string): string {
  const params = new URLSearchParams(search);
  const utmSource = (params.get("utm_source") || "").trim().slice(0, 50);
  const utmContent = (params.get("utm_content") || "").trim().slice(0, 60);
  if (!utmSource && !utmContent) return "lp";
  return `lp:${utmSource || "-"}:${utmContent || "-"}`;
}

/**
 * Reverse of buildLeadSource, for the admin. Everything after the second ":"
 * is utm_content, so video ids that contain ":" survive. Returns null for
 * sources that aren't from a landing page.
 */
export function parseLeadSource(
  source: string | null | undefined,
): { utmSource: string | null; utmContent: string | null } | null {
  if (source !== "lp" && !source?.startsWith("lp:")) return null;
  const [, utmSource = "-", ...content] = source.split(":");
  const utmContent = content.join(":") || "-";
  return {
    utmSource: utmSource === "-" ? null : utmSource,
    utmContent: utmContent === "-" ? null : utmContent,
  };
}

function queuePendingLead(payload: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(PENDING_LEADS_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    localStorage.setItem(PENDING_LEADS_KEY, JSON.stringify(queue));
  } catch {}
}

export async function flushPendingLeads() {
  try {
    const raw = localStorage.getItem(PENDING_LEADS_KEY);
    if (!raw) return;
    const queue: Record<string, unknown>[] = JSON.parse(raw);
    if (!queue.length) return;
    const remaining: Record<string, unknown>[] = [];
    for (const payload of queue) {
      const ok = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.ok)
        .catch(() => false);
      if (!ok) remaining.push(payload);
    }
    localStorage.setItem(PENDING_LEADS_KEY, JSON.stringify(remaining));
  } catch {}
}

/**
 * Must be called straight from the submit handler, before any await: WhatsApp
 * opens synchronously with the click so mobile Safari never blocks the popup
 * while we wait on the network. Then the lead is saved; if that fails it goes
 * to a localStorage queue flushed on the next visit.
 */
export async function submitLead(input: LeadInput): Promise<void> {
  const { courseSlug, courseTitle, email, phone, city, tiktokHandle = "", website = "", quizAnswers, source, ageRange } = input;
  const payload: Record<string, unknown> = { courseSlug, courseTitle, email, phone, city, tiktokHandle, website };
  if (quizAnswers?.length) payload.quizAnswers = quizAnswers;
  if (source) payload.source = source;
  if (ageRange) payload.ageRange = ageRange;

  trackConversion("lead_form_submit", courseSlug);

  window.open(buildWhatsAppUrl(input), "_blank", "noopener,noreferrer");
  trackConversion("whatsapp_open", courseSlug);

  // fetch with keepalive, not sendBeacon: a beacon reports success as soon as
  // it's queued, so a lead the server rejected (rate limit, database error)
  // would be lost instead of reaching the retry queue. keepalive still lets
  // the request finish if the page is backgrounded for WhatsApp.
  const ok = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then((res) => res.ok)
    .catch(() => false);
  if (!ok) queuePendingLead(payload);
}
