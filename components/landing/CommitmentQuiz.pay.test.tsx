// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CommitmentQuiz } from "./CommitmentQuiz";

// Only the side effects are stubbed: no WhatsApp popup, no lead saved.
vi.mock("@/lib/submitLead", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/submitLead")>()),
  flushPendingLeads: () => {},
  submitLead: () => Promise.resolve(),
}));
vi.mock("@/lib/analytics", () => ({ trackConversion: () => {} }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

function setValue(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function submitQuiz(courseSlug: string) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() =>
    root!.render(
      <CommitmentQuiz
        courseSlug={courseSlug}
        courseTitle="Kelas X"
        coursePrice="Rp 199.000"
        intro="-"
        questions={[{ question: "Pernah gagal?", label: "Pernah gagal", pain: "pernah gagal" }]}
        resultNoPain="-"
        onlineSummary="Video 20 menit"
      />
    )
  );
  const yes = [...host.querySelectorAll("button")].find((b) => b.textContent === "Ya")!;
  act(() => yes.click());
  act(() => {
    setValue("lp-name", "Ani");
    setValue("lp-email", "ani@gmail.com");
    setValue("lp-phone", "081234567890");
  });
  const form = host.querySelector("form")!;
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  return host;
}

describe("CommitmentQuiz after the form", () => {
  it("offers the Lynk checkout first for a course on Lynk, with WhatsApp kept", async () => {
    const el = await submitQuiz("fu-kian");
    const pay = [...el.querySelectorAll("a")].find((a) => a.textContent?.includes("Bayar Sekarang"));
    expect(pay?.getAttribute("href")).toBe(
      "https://lynk.id/cecelinachang/ep36mr441n81/checkout?utm_source=website&utm_medium=landing_page&utm_campaign=fu-kian"
    );
    expect(el.textContent).toContain("Buka WhatsApp");
  });

  it("keeps the WhatsApp-only screen for a course that is not on Lynk", async () => {
    const el = await submitQuiz("kelas-x");
    expect(el.textContent).not.toContain("Bayar Sekarang");
    expect(el.textContent).toContain("Tinggal kirim pesannya ke Cece");
  });
});
