"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import type { QuizQuestion } from "@/app/data/landing-pages";
import { trackConversion } from "@/lib/analytics";
import { buildLeadSource, buildWhatsAppUrl, flushPendingLeads, submitLead } from "@/lib/submitLead";
import { isValidIndonesianPhone, suggestEmailFix } from "@/lib/leadValidation";
import { AGE_RANGES } from "@/lib/leadFields";

interface CommitmentQuizProps {
  courseSlug: string;
  courseTitle: string;
  coursePrice: string;
  intro: string;
  questions: QuizQuestion[];
  resultNoPain: string;
}

const inputClass =
  "w-full min-h-12 px-4 py-3 text-base border border-steel-line rounded-xl bg-white focus:ring-2 focus:ring-sambal/40 focus:border-sambal outline-none transition-colors";

export function CommitmentQuiz({ courseSlug, courseTitle, coursePrice, intro, questions, resultNoPain }: CommitmentQuizProps) {
  const [answers, setAnswers] = useState<(boolean | undefined)[]>(() => questions.map(() => undefined));
  const [step, setStep] = useState(0); // questions.length = result + form
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [phoneError, setPhoneError] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const started = useRef(false);
  const completed = useRef(false);

  useEffect(() => {
    flushPendingLeads();
  }, []);

  const done = step >= questions.length;
  const pains = questions.flatMap((q, i) => (answers[i] && q.pain ? [q.pain] : []));
  const emailFix = suggestEmailFix(email);

  function answer(value: boolean) {
    if (!started.current) {
      started.current = true;
      trackConversion("quiz_start", courseSlug);
    }
    setAnswers((prev) => prev.map((a, i) => (i === step ? value : a)));
    if (step === questions.length - 1 && !completed.current) {
      completed.current = true;
      trackConversion("quiz_complete", courseSlug);
    }
    setStep(step + 1);
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
    // The age chips are styled radios, so the browser's own "required" bubble
    // has nothing visible to point at; show our own message instead.
    if (!ageRange) {
      setAgeError(true);
      document.getElementById("lp-age")?.scrollIntoView({ block: "center" });
      return;
    }
    setSubmitting(true);

    const lead = {
      courseSlug,
      courseTitle,
      coursePrice,
      email,
      phone,
      city,
      ageRange,
      website,
      pains,
      quizAnswers: questions.map((q, i) => `${q.label}: ${answers[i] ? "Ya" : "Tidak"}`),
      // Read at submit time rather than via useSearchParams, which would force
      // this prerendered page into a client-side rendering bailout.
      source: buildLeadSource(window.location.search),
    };
    // Show the fallback "Buka WhatsApp" link right away: in-app browsers
    // (TikTok, Instagram) often ignore window.open, and the save below can be
    // slow on mobile data. submitLead opens WhatsApp before its first await,
    // keeping the popup attached to this click.
    setWhatsappUrl(buildWhatsAppUrl(lead));
    await submitLead(lead);
  }

  return (
    <section id="cek" className="scroll-mt-4 bg-kecap px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-2 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em] text-white">
          Cek dulu, kamu cocok ikut kelas ini?
        </h2>
        <p className="mb-7 text-white/75">
          {intro} Harga kelasnya {coursePrice}, akses seumur hidup.
        </p>

        <div className="rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
          {!done && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-steel-line"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={questions.length}
                  aria-valuenow={step}
                  aria-label="Progres kuis"
                >
                  <div
                    className="h-full rounded-full bg-sambal transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${(step / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums text-steel">
                  {step + 1}/{questions.length}
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
                {pains.length > 0 ? (
                  <p className="leading-relaxed text-kecap">
                    Kamu bilang <strong>{pains.join(" dan ")}</strong> — ini persis yang dibongkar di kelas ini.
                  </p>
                ) : (
                  <p className="leading-relaxed text-kecap">{resultNoPain}</p>
                )}
                <p className="mt-3 text-sm text-kecap/75">
                  Isi datamu, lalu lanjut chat Cece di WhatsApp untuk daftar ({coursePrice}).
                </p>
              </div>

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
                      Link video kelas (Google Drive) dikirim ke email ini.
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
                <fieldset id="lp-age" aria-describedby={ageError ? "lp-age-error" : undefined}>
                  <legend className="mb-1.5 text-sm font-semibold text-kecap">Umur</legend>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((range) => (
                      <label
                        key={range}
                        className="cursor-pointer rounded-xl border border-steel-line bg-white px-3.5 py-2.5 text-sm font-semibold text-kecap transition-colors has-[:checked]:border-kecap has-[:checked]:bg-kecap has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sambal/40"
                      >
                        <input
                          type="radio"
                          name="lp-age"
                          value={range}
                          checked={ageRange === range}
                          onChange={() => {
                            setAgeRange(range);
                            setAgeError(false);
                          }}
                          className="sr-only"
                        />
                        {range}
                      </label>
                    ))}
                  </div>
                  {ageError && (
                    <p id="lp-age-error" className="mt-1.5 text-sm font-semibold text-sambal" role="alert">
                      Pilih salah satu rentang umur dulu ya.
                    </p>
                  )}
                </fieldset>
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
                <ol className="space-y-2 rounded-2xl border border-steel-line p-4 text-sm leading-snug text-kecap/85">
                  {[
                    "WhatsApp terbuka, pesanmu sudah terisi. Tinggal kirim.",
                    "Cece balas dengan info rekening.",
                    "Setelah transfer, link video dikirim ke emailmu.",
                  ].map((step, i) => (
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
              <button
                type="button"
                onClick={() => setStep(questions.length - 1)}
                className="tap-target mt-4 inline-flex items-center gap-1 text-sm font-medium text-steel hover:text-sambal"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Ubah jawaban
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
