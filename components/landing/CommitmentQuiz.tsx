"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import type { OfflineClass, QuizQuestion } from "@/app/data/landing-pages";
import { trackConversion } from "@/lib/analytics";
import { buildWhatsAppUrl, flushPendingLeads, submitLead } from "@/lib/submitLead";
import { buildQuizLead, offersOffline, quizPains } from "@/lib/quizLead";
import { isValidIndonesianPhone, suggestEmailFix } from "@/lib/leadValidation";
import { NEXT_SCHEDULE_LABEL, offlineScheduleLabel } from "@/lib/offlineClass";

interface CommitmentQuizProps {
  courseSlug: string;
  courseTitle: string;
  coursePrice: string;
  intro: string;
  questions: QuizQuestion[];
  resultNoPain: string;
  /** Short description of the online class for the class choice, e.g. "Video 40 menit, akses seumur hidup". */
  onlineSummary: string;
  offlineClass?: OfflineClass;
}

function isGmail(email: string): boolean {
  return /@(gmail|googlemail)\.com\s*$/i.test(email);
}

const inputClass =
  "w-full min-h-12 px-4 py-3 text-base border border-steel-line rounded-xl bg-white focus:ring-2 focus:ring-sambal/40 focus:border-sambal outline-none transition-colors";

export function CommitmentQuiz({
  courseSlug,
  courseTitle,
  coursePrice,
  intro,
  questions,
  resultNoPain,
  onlineSummary,
  offlineClass,
}: CommitmentQuizProps) {
  const [answers, setAnswers] = useState<(boolean | undefined)[]>(() => questions.map(() => undefined));
  // Steps: 0..n-1 are the yes/no questions, n is result + form.
  const [step, setStep] = useState(0);
  // Came in through a "Daftar" button: straight to the form, no questions.
  const [skipped, setSkipped] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [phoneError, setPhoneError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  // Online first: this page is sold on the Rp 399.000 class, and a seller who
  // wants the offline one picks it on purpose.
  const [classChoice, setClassChoice] = useState<"offline" | "online">("online");
  const [scheduleLabel, setScheduleLabel] = useState(NEXT_SCHEDULE_LABEL);
  const started = useRef(false);
  const completed = useRef(false);

  const totalSteps = questions.length;
  const done = step >= totalSteps;
  const pains = quizPains(questions, answers);
  const emailFix = suggestEmailFix(email);
  // Upsell: sellers also see the offline class, second, next to the online one.
  const offerOffline = offersOffline(questions, answers, offlineClass);
  const isOffline = offerOffline && classChoice === "offline";

  useEffect(() => {
    flushPendingLeads();
  }, []);

  // Every "Daftar" button on the page is a plain <a href="#daftar">, so it
  // works before hydration too (it just scrolls). Once hydrated, a tap also
  // skips the questions and opens the form. A page opened at #daftar does
  // the same.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    function openForm() {
      // Someone who already answered keeps their answers and result.
      if (stepRef.current >= totalSteps) return;
      setSkipped(true);
      setStep(totalSteps);
      trackConversion("quiz_skip", courseSlug);
    }
    function onClick(e: MouseEvent) {
      if ((e.target as Element | null)?.closest?.('a[href="#daftar"]')) openForm();
    }
    if (window.location.hash === "#daftar") queueMicrotask(openForm);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [courseSlug, totalSteps]);

  function answer(value: boolean) {
    if (!started.current) {
      started.current = true;
      trackConversion("quiz_start", courseSlug);
    }
    const next = answers.map((a, i) => (i === step ? value : a));
    setAnswers(next);
    if (step + 1 >= totalSteps) finishQuiz(next);
    setStep(step + 1);
  }

  function finishQuiz(finalAnswers: (boolean | undefined)[]) {
    if (!completed.current) {
      completed.current = true;
      // First-party only: the ads optimise on Lead (the form submit), so
      // finishing the questions is no longer sent to the pixels.
      trackConversion("quiz_complete", courseSlug);
    }
    if (offlineClass) {
      // Evaluated now, not at render, so a cached page never shows a past date.
      setScheduleLabel(offlineScheduleLabel(offlineClass.schedule, new Date()));
      if (offersOffline(questions, finalAnswers, offlineClass)) trackConversion("offline_upsell_shown", courseSlug);
    }
  }

  function restartQuiz() {
    setSkipped(false);
    setAnswers(questions.map(() => undefined));
    setStep(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    // Synchronous check, so WhatsApp still opens inside this click when it passes.
    if (!isValidIndonesianPhone(phone)) {
      setPhoneError(true);
      document.getElementById("lp-phone")?.focus();
      return;
    }
    setSubmitting(true);

    const lead = buildQuizLead({
      course: { slug: courseSlug, title: courseTitle, price: coursePrice },
      questions,
      answers,
      // City only matters for the offline class; the online form doesn't ask.
      contact: { name, email, phone, city: isOffline ? city : "", website },
      classChoice,
      offlineClass,
      scheduleLabel,
      // Read at submit time rather than via useSearchParams, which would force
      // this prerendered page into a client-side rendering bailout.
      search: window.location.search,
    });
    // Show the fallback "Buka WhatsApp" link right away: in-app browsers
    // (TikTok, Instagram) often ignore window.open, and the save below can be
    // slow on mobile data. submitLead opens WhatsApp before its first await,
    // keeping the popup attached to this click.
    setWhatsappUrl(buildWhatsAppUrl(lead));
    if (isOffline) trackConversion("offline_lead", courseSlug);
    await submitLead(lead);
  }

  return (
    <section id="cek" className="scroll-mt-4 bg-kecap px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-2 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em] text-white">
          Cek dulu, kamu cocok ikut kelas ini?
        </h2>
        <p className="mb-7 text-white/75">{intro}</p>

        <div id="daftar" className="scroll-mt-4 rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
          {!done && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-steel-line"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={totalSteps}
                  aria-valuenow={step}
                  aria-label="Progres kuis"
                >
                  <div
                    className="h-full rounded-full bg-sambal transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums text-steel">
                  {step + 1}/{totalSteps}
                </span>
              </div>
              <p className="mb-7 min-h-[5.5rem] font-display text-[1.4rem] font-bold leading-snug text-kecap sm:text-2xl" aria-live="polite">
                {questions[step].question}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => answer(true)}
                  className="tap-target min-h-14 rounded-xl bg-sambal px-6 py-4 text-lg font-bold text-white shadow-[0_5px_0_0_var(--color-sambal-deep)] transition-[transform,box-shadow] duration-150 active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--color-sambal-deep)] motion-reduce:transition-none"
                >
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => answer(false)}
                  className="tap-target min-h-14 rounded-xl border-2 border-steel-line bg-white px-6 py-4 text-lg font-bold text-kecap transition-colors hover:border-steel active:bg-enamel"
                >
                  Tidak
                </button>
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="tap-target mt-4 inline-flex items-center gap-1 text-sm font-medium text-steel hover:text-sambal"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali
                </button>
              )}
            </div>
          )}

          {done && whatsappUrl && (
            <div className="text-center" aria-live="polite">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-seledri/10 text-seledri">
                <Check className="h-8 w-8" aria-hidden="true" />
              </div>
              <p className="mb-2 font-display text-2xl font-extrabold text-kecap">Tinggal kirim pesannya ke Cece</p>
              <p className="mb-6 text-kecap/70">
                WhatsApp sudah terbuka dengan pesan yang siap dikirim. Belum terbuka?
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-seledri px-6 py-4 font-bold text-white"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Buka WhatsApp
              </a>
            </div>
          )}

          {done && !whatsappUrl && (
            <div>
              <div className="mb-6 rounded-2xl bg-mie/25 p-4 sm:p-5" aria-live="polite">
                {skipped ? (
                  <p className="font-display text-xl font-extrabold leading-snug text-kecap">
                    Daftar {courseTitle} · {coursePrice}
                  </p>
                ) : pains.length > 0 ? (
                  <p className="leading-relaxed text-kecap">
                    Kamu bilang <strong>{pains.join(" dan ")}</strong> — ini persis yang dibongkar di kelas ini.
                  </p>
                ) : (
                  <p className="leading-relaxed text-kecap">{resultNoPain}</p>
                )}
                <p className="mt-3 text-sm text-kecap/75">
                  {offerOffline
                    ? "Karena kamu mau jualan, ada juga kelas offline. Pilih salah satu, lalu isi datamu."
                    : `Isi datamu, lalu lanjut chat Cece di WhatsApp untuk daftar (${coursePrice}).`}
                </p>
              </div>

              {offerOffline && offlineClass && (
                <fieldset className="mb-6 space-y-3">
                  <legend className="sr-only">Pilih kelas</legend>
                  <label className="block cursor-pointer rounded-2xl border-2 border-steel-line p-4 transition-colors has-[:checked]:border-sambal has-[:checked]:bg-sambal/[0.04] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sambal/40">
                    <input
                      type="radio"
                      name="lp-class"
                      value="online"
                      checked={classChoice === "online"}
                      onChange={() => setClassChoice("online")}
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-display text-lg font-extrabold leading-tight">{courseTitle} (online)</span>
                      <RadioDot checked={classChoice === "online"} />
                    </span>
                    <span className="mt-1 block text-sm text-kecap/75">{onlineSummary}</span>
                    <span className="mt-2 block font-display text-xl font-extrabold">{coursePrice}</span>
                  </label>
                  <label className="block cursor-pointer rounded-2xl border-2 border-steel-line p-4 transition-colors has-[:checked]:border-sambal has-[:checked]:bg-sambal/[0.04] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sambal/40">
                    <input
                      type="radio"
                      name="lp-class"
                      value="offline"
                      checked={classChoice === "offline"}
                      onChange={() => setClassChoice("offline")}
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-display text-lg font-extrabold leading-tight">{offlineClass.title}</span>
                      <RadioDot checked={classChoice === "offline"} />
                    </span>
                    <span className="mt-1 block text-sm text-kecap/75">{offlineClass.fitReason}</span>
                    <span className="mt-3 block font-display text-2xl font-extrabold tracking-[-0.02em]">{offlineClass.price}</span>
                    <span className="block text-sm font-semibold text-seledri">
                      Sudah termasuk alat senilai <span className="whitespace-nowrap">{offlineClass.equipmentValue}</span>
                    </span>
                    <ul className="mt-3 space-y-1.5 text-sm leading-snug text-kecap/85">
                      <OfferLine>Praktik langsung {offlineClass.duration}, {offlineClass.groupSize}</OfferLine>
                      <OfferLine>Alat gratis: {offlineClass.equipment.join(", ")}</OfferLine>
                      <OfferLine>
                        {offlineClass.perks.map((p, i) => (i ? p.charAt(0).toLowerCase() + p.slice(1) : p)).join(", ")}
                      </OfferLine>
                      <OfferLine>
                        {scheduleLabel}, {offlineClass.location}
                      </OfferLine>
                    </ul>
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer font-semibold text-sambal">Yang dipelajari</summary>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-kecap/80">
                        {offlineClass.learn.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  </label>
                </fieldset>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <div>
                  <label htmlFor="lp-name" className="mb-1.5 block text-sm font-semibold text-kecap">Nama</label>
                  <input
                    id="lp-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Nama panggilanmu"
                  />
                </div>
                {isOffline && (
                  <div>
                    <label htmlFor="lp-city" className="mb-1.5 block text-sm font-semibold text-kecap">Asal Kota</label>
                    <input
                      id="lp-city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                      placeholder="Jakarta"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="lp-email" className="mb-1.5 block text-sm font-semibold text-kecap">Email</label>
                  <input
                    id="lp-email"
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="nama@email.com"
                    aria-describedby="lp-email-hint"
                  />
                  {emailFix ? (
                    <p id="lp-email-hint" className="mt-1.5 text-sm text-kecap">
                      Maksudnya{" "}
                      <button
                        type="button"
                        onClick={() => setEmail(emailFix)}
                        className="font-bold text-sambal underline underline-offset-2"
                      >
                        {emailFix}
                      </button>
                      ?
                    </p>
                  ) : (
                    <p id="lp-email-hint" className="mt-1.5 text-sm text-steel">
                      {/* Cece shares the video through Google Drive "manage access",
                          which only opens for a Google account with this address. */}
                      {isOffline
                        ? "Untuk data pendaftaran kelas offline."
                        : isGmail(email) || !email.includes("@")
                          ? "Link video kelas dikirim lewat Google Drive ke email ini. Paling lancar pakai Gmail."
                          : "Link Google Drive cuma bisa dibuka kalau email ini terdaftar di akun Google. Kalau belum, pakai Gmail saja."}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lp-phone" className="mb-1.5 block text-sm font-semibold text-kecap">Nomor WhatsApp</label>
                  <input
                    id="lp-phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError && isValidIndonesianPhone(e.target.value)) setPhoneError(false);
                    }}
                    onBlur={() => setPhoneError(phone.trim() !== "" && !isValidIndonesianPhone(phone))}
                    className={`${inputClass} ${phoneError ? "border-sambal ring-2 ring-sambal/30" : ""}`}
                    placeholder="0812xxxxxxx"
                    aria-invalid={phoneError}
                    aria-describedby="lp-phone-hint"
                  />
                  {phoneError ? (
                    <p id="lp-phone-hint" className="mt-1.5 text-sm font-semibold text-sambal" role="alert">
                      Nomornya belum pas. Tulis nomor HP yang ada WhatsApp-nya, contoh 0812 3456 7890.
                    </p>
                  ) : (
                    <p id="lp-phone-hint" className="mt-1.5 text-sm text-steel">
                      Supaya Cece bisa balas kalau pesanmu belum terkirim.
                    </p>
                  )}
                </div>
                <ol className="space-y-2 rounded-2xl border border-steel-line p-4 text-sm leading-snug text-kecap/85">
                  {(isOffline && offlineClass
                    ? [
                        "WhatsApp terbuka, pesanmu sudah terisi. Tinggal kirim.",
                        "Cece balas dengan info rekening dan konfirmasi slot.",
                        `Datang ke ${offlineClass.location} sesuai jadwal.`,
                      ]
                    : [
                        "WhatsApp terbuka, pesanmu sudah terisi. Tinggal kirim.",
                        "Cece balas dengan info rekening.",
                        "Setelah transfer, link video dikirim ke emailmu.",
                      ]
                  ).map((step, i) => (
                    <li key={step} className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kecap text-[0.7rem] font-bold text-white">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <button
                  type="submit"
                  disabled={submitting}
                  className="tap-target flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-seledri px-6 py-4 text-lg font-bold text-white shadow-[0_5px_0_0_#155a2a] transition-[transform,box-shadow] duration-150 active:translate-y-[3px] active:shadow-[0_2px_0_0_#155a2a] disabled:opacity-60 motion-reduce:transition-none"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" /> Lanjut ke WhatsApp
                </button>
              </form>
              {skipped ? (
                <button
                  type="button"
                  onClick={restartQuiz}
                  className="tap-target mt-4 inline-flex items-center gap-1 text-sm font-medium text-steel hover:text-sambal"
                >
                  Belum yakin? Jawab {totalSteps} pertanyaan singkat dulu
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(totalSteps - 1)}
                  className="tap-target mt-4 inline-flex items-center gap-1 text-sm font-medium text-steel hover:text-sambal"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Ubah jawaban
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
        checked ? "border-sambal bg-sambal text-white" : "border-steel-line"
      }`}
      aria-hidden="true"
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
    </span>
  );
}

function OfferLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
