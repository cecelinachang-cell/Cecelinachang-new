import { describe, expect, it } from "vitest";
import type { OfflineClass, QuizQuestion } from "@/app/data/landing-pages";
import { NEXT_SCHEDULE_LABEL } from "./offlineClass";
import { buildQuizLead, offersOffline, quizPains } from "./quizLead";

const questions: QuizQuestion[] = [
  { question: "Keras?", label: "Bakso keras", pain: "baksonya sering keras" },
  { question: "Resep beda?", label: "Resep beda", pain: "resepnya beda-beda" },
  { question: "Jualan?", label: "Rencana jualan", offlineFit: true },
  { question: "Siap?", label: "Siap belajar" },
];

const offlineClass = {
  title: "Kelas Offline Bakso Sapi",
  price: "Rp 5.000.000",
} as OfflineClass;

const base = {
  course: { slug: "bakso-sapi-premium", title: "Kelas Bakso Sapi Premium", price: "Rp 399.000" },
  questions,
  ageRange: "35–44",
  contact: { email: "a@gmail.com", phone: "081234567890", city: "Medan", website: "" },
  search: "?utm_source=tiktok&utm_content=v1",
  scheduleLabel: "Sabtu, 3 Okt 2026 · mulai 10.00",
  offlineClass,
};

describe("quizPains", () => {
  it("lists the pains of the questions answered yes, in order", () => {
    expect(quizPains(questions, [true, true, false, true])).toEqual(["baksonya sering keras", "resepnya beda-beda"]);
    expect(quizPains(questions, [false, true, true, true])).toEqual(["resepnya beda-beda"]);
  });
});

describe("offersOffline", () => {
  it("is true only when the offline-fit question was answered yes and a class exists", () => {
    expect(offersOffline(questions, [false, false, true, false], offlineClass)).toBe(true);
    expect(offersOffline(questions, [false, false, false, false], offlineClass)).toBe(false);
    expect(offersOffline(questions, [false, false, undefined, false], offlineClass)).toBe(false);
    expect(offersOffline(questions, [false, false, true, false], undefined)).toBe(false);
  });
});

describe("buildQuizLead", () => {
  it("builds an online lead for a visitor who doesn't plan to sell", () => {
    const lead = buildQuizLead({ ...base, answers: [true, false, false, true], classChoice: "offline" });
    expect(lead).toMatchObject({
      courseSlug: "bakso-sapi-premium",
      courseTitle: "Kelas Bakso Sapi Premium",
      coursePrice: "Rp 399.000",
      offline: false,
      email: "a@gmail.com",
      phone: "081234567890",
      city: "Medan",
      ageRange: "35–44",
      pains: ["baksonya sering keras"],
      source: "lp:tiktok:v1",
    });
    expect(lead.quizAnswers).toEqual([
      "Bakso keras: Ya",
      "Resep beda: Tidak",
      "Rencana jualan: Tidak",
      "Siap belajar: Ya",
    ]);
  });

  it("builds a dated offline lead when a seller keeps the offline class", () => {
    const lead = buildQuizLead({ ...base, answers: [true, true, true, true], classChoice: "offline" });
    expect(lead.courseTitle).toBe("Kelas Offline Bakso Sapi (Sabtu, 3 Okt 2026 · mulai 10.00)");
    expect(lead.coursePrice).toBe("Rp 5.000.000");
    expect(lead.offline).toBe(true);
    expect(lead.quizAnswers?.at(-1)).toBe("Pilihan kelas: Offline");
  });

  it("keeps the online class when a seller switches to it, and records the choice", () => {
    const lead = buildQuizLead({ ...base, answers: [true, true, true, true], classChoice: "online" });
    expect(lead.courseTitle).toBe("Kelas Bakso Sapi Premium");
    expect(lead.offline).toBe(false);
    expect(lead.quizAnswers?.at(-1)).toBe("Pilihan kelas: Online");
  });

  it("leaves the date out of the offline title once the class has started", () => {
    const lead = buildQuizLead({
      ...base,
      answers: [true, true, true, true],
      classChoice: "offline",
      scheduleLabel: NEXT_SCHEDULE_LABEL,
    });
    expect(lead.courseTitle).toBe("Kelas Offline Bakso Sapi");
  });

  it("never builds an offline lead for a course without an offline class", () => {
    const lead = buildQuizLead({
      ...base,
      answers: [true, true, true, true],
      classChoice: "offline",
      offlineClass: undefined,
    });
    expect(lead.offline).toBe(false);
    expect(lead.quizAnswers).not.toContain("Pilihan kelas: Offline");
  });
});
