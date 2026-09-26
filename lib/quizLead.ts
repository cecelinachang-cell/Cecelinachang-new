import type { OfflineClass, QuizQuestion } from "@/app/data/landing-pages";
import { NEXT_SCHEDULE_LABEL } from "./offlineClass";
import { buildLeadSource, type LeadInput } from "./submitLead";

type Answers = readonly (boolean | undefined)[];

/** The pains of the questions answered "yes", echoed on the result and in WhatsApp. */
export function quizPains(questions: readonly QuizQuestion[], answers: Answers): string[] {
  return questions.flatMap((q, i) => (answers[i] && q.pain ? [q.pain] : []));
}

/**
 * Upsell rule: only visitors who said yes to the offline-fit question ("mau
 * jualan?") see the offline class, and only when the course has one.
 */
export function offersOffline(questions: readonly QuizQuestion[], answers: Answers, offlineClass?: OfflineClass): boolean {
  const fitIndex = questions.findIndex((q) => q.offlineFit);
  return Boolean(offlineClass) && fitIndex >= 0 && answers[fitIndex] === true;
}

interface QuizLeadInput {
  course: { slug: string; title: string; price: string };
  questions: readonly QuizQuestion[];
  answers: Answers;
  /** No longer asked on the landing page; kept for callers that have one. */
  ageRange?: string;
  contact: { name: string; email: string; phone: string; city: string; website: string };
  classChoice: "offline" | "online";
  offlineClass?: OfflineClass;
  /** From offlineScheduleLabel(); NEXT_SCHEDULE_LABEL means no date to show. */
  scheduleLabel: string;
  /** window.location.search, for the UTM source. */
  search: string;
}

/** Everything the quiz sends: the lead saved by /api/leads and the WhatsApp message. */
export function buildQuizLead(input: QuizLeadInput): LeadInput {
  const { course, questions, answers, offlineClass, scheduleLabel } = input;
  const offered = offersOffline(questions, answers, offlineClass);
  const offline = offered && input.classChoice === "offline" && offlineClass !== undefined;

  // A "Daftar" tap skips the questions; say so rather than record a row of "Tidak".
  const skipped = answers.every((a) => a === undefined);
  const quizAnswers = skipped
    ? ["Langsung daftar, tanpa kuis"]
    : questions.map((q, i) => `${q.label}: ${answers[i] ? "Ya" : "Tidak"}`);
  if (offered) quizAnswers.push(`Pilihan kelas: ${offline ? "Offline" : "Online"}`);

  const dated = scheduleLabel !== NEXT_SCHEDULE_LABEL;
  return {
    courseSlug: course.slug,
    courseTitle: offline ? `${offlineClass.title}${dated ? ` (${scheduleLabel})` : ""}` : course.title,
    coursePrice: offline ? offlineClass.price : course.price,
    offline,
    ...input.contact,
    ageRange: input.ageRange,
    pains: quizPains(questions, answers),
    quizAnswers,
    source: buildLeadSource(input.search),
  };
}
