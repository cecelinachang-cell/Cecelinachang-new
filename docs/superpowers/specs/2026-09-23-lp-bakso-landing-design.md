# Social-traffic landing page → course sales (`/lp/[slug]`)

## Context
People who watch Cece's social videos (TikTok/IG/FB) need a page to land on when they tap the link. Today the only choice is `/kursus/[slug]`. That's a general catalog page with the site nav, related products, and a WhatsApp button. It doesn't talk about the viewer's pain, and it has many ways to leave. Goal: a focused, persuasive sales page that turns video viewers into WhatsApp enrollments.

Decisions made with the user:
- **Per-course template** at `/lp/[slug]`. Copy is written by hand for **Bakso Sapi Premium** first. More courses can be added later as data only.
- **Audience:** home cooks whose bakso keeps failing (not people who want to sell).
- **The persuasion engine is the owner's own story:** 18 years running a bakso factory (see facts below).
- **CTA:** a "micro-yes" quiz ("Apakah kamu…?") that builds commitment. It ends with a personal result, then the existing email + WhatsApp fields, then opens a WhatsApp chat with Cece. The quiz answers are **saved with the lead** and included in the WhatsApp message.
- **Placement:** long-form page in this order: hook → pain → why it fails → factory story → result → proof → offer → objections → quiz. Every CTA jumps to the quiz.
- **Indexing:** noindex. The page is for ads and social only; Google traffic keeps going to `/kursus`.
- **No fake urgency.** Normal price, no countdown timer, no invented discount. No money-back promise either: `POLICIES.COURSE_REFUND` says digital classes have no refund.

## Facts from the interview (the only claims the page may make)
- The factory ran **1998–2016, 18 years**, owned and run by Cece.
- At its peak it produced **puluhan ton bakso per bulan**.
- **2016:** Cece fell ill. That was the turning point: she realized chasing production and money wasn't the most important thing, closed the factory, and now passes the knowledge on instead. No medical details are invented, and the user approves the wording before it ships.
- **What a factory knows that YouTube doesn't:** meat/ice temperature, kneading time and technique, and water temperature when boiling. These map directly onto the existing `course.benefits`.
- **Results students report:** some succeeded on the first try after failing repeatedly; some now sell their bakso. Written as "ada murid yang…", never as a promise.
- **Equipment (the #1 DM question):** a food processor from **800 W up** works. The Signora Food Processor Dcopper (1000 W, `Rp 2.980.000`, id `food-processor-dcopper`) is recommended but not required. Said plainly and early, so nobody buys the class and then fails.
- From the existing data: 4,509 students, `Rp 399.000` (was 299k; changed 2026-09-23), 40-minute video, lifetime access, consultation with Cece included, recipe e-book, certificate.

## Files

### New
- `app/lp/[slug]/page.tsx`: server component. Loads the course (live price, student count, image, benefits) and the landing copy for that slug. Calls `notFound()` if either is missing.
  - Metadata: `robots: { index: false, follow: true }`. This matches what the missing-course case already uses in `/kursus/[slug]`.
  - `revalidate = 60`, plus `generateStaticParams` over the slugs that have landing copy.
- `app/lp/layout.tsx`: server layout that outputs `<style>[data-site-chrome]{display:none!important}</style>`. This hides the global Navbar, Footer, and ChatbotWidget on `/lp/*` only, so the page has no exits.
  - The style is rendered on the server, so nothing flashes on load, and no new client boundary is added.
  - The root layout is left alone on purpose. The repo recently fixed several hydration bugs that only showed up in production.
- `app/data/landing-pages.ts`: typed copy config keyed by slug (`LandingCopy`: hook, subhook, pains[], rootCauses[], story, beforeAfter[], quiz questions[], faq[]). Only `bakso-sapi-premium` for now. A new course later means a new entry here, no code change.
- `components/landing/*`: section components that take props only:
  - `LandingHero`, `PainSection`, `RootCauseSection`, `FactoryStorySection`, `TransformationSection`, `OfferStack`, `EquipmentSection`, `LandingFaq`
  - `LandingFooter`: minimal, legal links only.
  - `StickyQuizBar`: mobile bar that scrolls to `#cek`. Reuses the `has-sticky-cta` body class, like `MobileCourseBar`.
- `components/landing/CommitmentQuiz.tsx`: client component.
  1. One question per screen: yes/no buttons, a progress bar, and a back button.
  2. Result screen that repeats the viewer's "yes" pains back to them, e.g. "Kamu bilang baksomu sering keras & pecah — ini persis yang dibongkar di kelas ini". If nobody answered "yes", it shows a softer message and the form still appears.
  3. Lead step with the same fields as `LeadFormModal`: email, WhatsApp number, city (optional), plus the hidden honeypot field. Submitting opens WhatsApp.
  - Tracking: `quiz_start` and `quiz_complete`, then the existing `lead_form_submit` and `whatsapp_open`.
  - On load it reads `utm_source`/`utm_content` from the URL and sends `source = "lp:<utm_source>:<utm_content>"` with the lead. Nothing in the repo stores UTMs today (`AnalyticsTracker` only records the pathname). With this, the admin can see which video produced each sign-up.
- `lib/courses.ts`: moves the cached `getCourseBySlug` out of `app/kursus/[slug]/page.tsx` without changes, keeping the `cache(unstable_cache(...))` wrapper that fixed React error #419. Both pages import it from here.
- `lib/submitLead.ts`: moves the submit logic out of `LeadFormModal`: open WhatsApp synchronously first, then `sendBeacon` → fetch → localStorage queue, plus `flushPendingLeads`. Adds optional `quizAnswers` and `source`. When there are answers, the WhatsApp message gets a "Kendala saya: …" line.
- `supabase/migrations/20260922_lead_quiz_answers.sql`: `alter table public.leads add column if not exists quiz_answers jsonb, add column if not exists source text;`

### Modified
- `components/navbar.tsx`, `components/footer.tsx`, `components/chatbot-widget.tsx`: add a `data-site-chrome` attribute to each root element. Attribute only, no logic. `app/layout.tsx` is unchanged.
- `app/kursus/[slug]/page.tsx`: import `getCourseBySlug` from `lib/courses.ts`. Behaviour stays the same.
- `components/LeadFormModal.tsx`: calls `submitLead()`. Behaviour stays the same.
- `app/api/leads/route.ts`: accepts `quizAnswers` (up to 10 strings, 200 characters each) and `source` (up to 120 characters). If the insert fails because a column is missing, it retries without those two fields, so no lead is lost if the migration hasn't been applied yet.
- `lib/analytics.ts`: adds `'quiz_start' | 'quiz_complete'` to `ConversionType`. The `conversions.type` column is free text, so no DB change is needed. These two events don't send a Meta pixel event.
- `app/admin/leads/page.tsx`: shows `quiz_answers` and `source` (an LP badge plus the UTM values) in the course sign-ups table.
- `components/TestimonialCarousel.tsx`: new optional `hideFallback` prop that renders nothing instead of `FALLBACK_TESTIMONIALS`. The fallback images are course food photos, not proof. The default is false, so the homepage doesn't change.

## Page flow & copy outline (Bakso Sapi Premium, "kamu" voice)
Tone: warm, conversational Indonesian, like Cece talking. Every claim traces back to the facts above.

1. **Hero:**
   - Headline: "Bakso bikinanmu keras kayak karet, pecah waktu direbus, atau malah rasa tepung?"
   - Sub: "Bukan salah tanganmu. Yang kurang cuma teknik pabrik yang nggak pernah ditulis di resep gratisan."
   - CTA: "Cek dulu, kamu cocok ikut kelas ini? (30 detik)"
   - Proof strip: `18 tahun punya pabrik bakso · puluhan ton per bulan · {students} murid`, next to the course image.
2. **Pain (agitate):** "Kalau kamu pernah ngalamin ini…" followed by a checklist:
   - bakso is hard, crumbly, or splits while boiling
   - it tastes of flour or smells fishy
   - the shape isn't round
   - expensive meat gets thrown away or eaten with embarrassment
   - 10 YouTube videos give 10 different measurements

   It closes with the feeling of serving it to family.
3. **Why it keeps failing (reframe):** the three things a factory controls and a home recipe never mentions — meat/ice temperature, kneading time and technique, boiling water temperature. Line: "Resep gratis kasih takaran. Yang bikin bakso kenyal itu suhu, waktu, dan cara — bukan takarannya."
4. **Factory story (the persuasion core):** first draft, the user approves every line before it ships:
   > Selama 18 tahun, dari 1998 sampai 2016, dapur saya bukan dapur rumahan. Kami memproduksi puluhan ton bakso setiap bulan. Setiap hari saya mengurus suhu daging, waktu uleni, dan panas air rebusan — bukan karena pengen sempurna, tapi karena satu batch gagal artinya kerugian jutaan rupiah.
   >
   > Tahun 2016 saya jatuh sakit. Di titik itu saya sadar, mengejar produksi dan uang bukan yang paling penting. Saya menutup pabriknya.
   >
   > Tapi ilmunya nggak ikut saya tutup. Terlalu sayang kalau hilang begitu saja. Sekarang teknik yang dulu cuma dipakai di dapur pabrik itu saya turunkan ke dapur rumah — punya kamu.

   Photo: `/images/lina-avatar.jpeg`, plus a `Marginalia` handwritten note.
5. **Transformation:** a two-column before/after table, then `course.benefits` under "Yang akan kamu kuasai", each tied back to the factory ("standar yang sama yang saya pakai waktu produksi berton-ton").
6. **Proof:** the live student count, the 18-year factory background, and honestly framed student results: "Ada murid yang berhasil di percobaan pertama setelah bertahun-tahun gagal. Ada juga yang sekarang jualan baksonya sendiri." Testimonial screenshots appear only when real rows exist (`TestimonialCarousel hideFallback`).
7. **Equipment / objection handler (right before the offer, since it's the #1 DM question):** "Perlu mesin pabrik seperti punya Cece?" → No. A food processor from 800 W up is enough; the class teaches how to get factory texture with home tools. The Signora Dcopper (1000 W) is recommended, not required, and links to `/toko` — it's already mapped to this course in `courseProducts`.
8. **Offer stack:**
   - 40-minute video with lifetime access
   - direct consultation with Cece
   - recipe e-book (PDF)
   - digital certificate
   - price: `{course.price}`

   Risk reducer: "Bingung setelah beli? Konsultasi langsung dengan Cece sudah termasuk." Value anchor: "Teknik dari 18 tahun produksi, dipadatkan jadi 40 menit."
9. **Quiz `#cek`:** 4 micro-yes questions, then the result, then the lead form:
   - "Apakah baksomu sering keras, lembek, atau pecah?"
   - "Apakah kamu sudah coba resep internet tapi hasilnya beda-beda terus?"
   - "Apakah kamu ingin bakso buatanmu kenyal & kaya rasa daging seperti bakso premium?"
   - "Apakah kamu siap luangkan 40 menit untuk belajar tekniknya?"
10. **FAQ:** Is it OK for beginners? What tools do I need? (800 W+, honestly.) How does access work? What's the refund policy? (Stated honestly from `POLICIES.COURSE_REFUND`.) Then a final CTA to the quiz.
11. **LandingFooter:** links to syarat-ketentuan, kebijakan-privasi, pengembalian-dana.

Visual: the existing tokens (cream, terracotta, rust-ink, butter, Fraunces serif, and Caveat `font-hand` for Cece's handwritten notes via `Marginalia`). Built mobile-first, since this traffic comes from phones: readable at 360px, with `tap-target` on buttons.

## Reuse
- `getCourseBySlug` (moved to `lib/courses.ts`)
- `LeadFormModal` submit logic, now `submitLead`
- `trackConversion` (`lib/analytics.ts`)
- `TestimonialCarousel`, `Marginalia`, `SquiggleUnderline`, `Button` (`components/ui/Button`)
- `POLICIES`, `isOptimizableImage`, `courseProducts` + `products` for the equipment section
- the `has-sticky-cta` pattern from `MobileCourseBar`

## Link to use in social bios/videos
`https://<site>/lp/bakso-sapi-premium?utm_source=tiktok&utm_content=<video-id>`. The UTM values are saved in `leads.source`.

## Verification
1. `npx tsc --noEmit` and `npm run lint`, then `npx vitest run`.
2. `npm run dev`, then check with Playwright at 390×844 and at 1280px:
   - `/lp/bakso-sapi-premium` renders with no navbar, footer, or chatbot, and nothing flashes on load. The `noindex` meta tag is present. The homepage and `/kursus` still show the site chrome.
   - Every CTA scrolls to `#cek`.
   - Quiz: answer yes/no → go back → the result repeats the answers → the form requires email and phone → submit opens `wa.me` with the "Kendala saya" line.
   - `/api/leads` returns 200, and the payload includes `quizAnswers` and `source` from `?utm_source=tiktok&utm_content=test1`.
   - `/lp/unknown-slug` returns 404.
   - `/kursus/bakso-sapi-premium` and its `LeadFormModal` still work, with no hydration errors in the console.
3. `npm run build` passes, and `/lp/bakso-sapi-premium` is prerendered.
4. The user applies the migration in Supabase. Until then, the API fallback still saves leads, just without the quiz answers.
5. The user reads the factory-story section and the results line and approves or edits the wording before it goes public.

---

## Handoff status (2026-09-23)

Plan approved by the user. Implementation started, then handed to another session.

**Done and typechecked (`npx tsc --noEmit` clean):**
- `lib/courses.ts` — new. `getCourseBySlug` + the `Course` interface moved here verbatim from `app/kursus/[slug]/page.tsx`, keeping the `cache(unstable_cache(...))` wrapper that fixed React error #419.
- `app/kursus/[slug]/page.tsx` — now imports `getCourseBySlug` from `@/lib/courses`; the local copy and the local `Course` interface are gone. No behaviour change.

**Update (2026-09-23, second session): all remaining items implemented and verified, uncommitted.**
- tsc clean; lint shows only the 2 pre-existing errors; vitest 25/25 (vitest is not in package.json, so install it with `npm i --no-save vitest`); `npm run build` prerenders `/lp/bakso-sapi-premium`; every Playwright check in "Verification" passed at 390px and 1280px.
- Deviations: the result screen and lead form share one screen. `dynamicParams = false`. `submitLead` now uses `fetch` with `keepalive` instead of `sendBeacon`, and `/api/leads` returns 500 when the insert fails, so rejected leads go to the retry queue. The lead rate limit is 5→20/min to allow for CGNAT. The copy softens "kerugian jutaan rupiah" to "kerugian besar" and "bertahun-tahun gagal" to "berkali-kali gagal", and the before/after lines are phrased as "tahu cara…" rather than promises.
- Still open: owner approval of the copy (story, root-cause explanations, "dijelaskan dari dasar"), and the user applying `supabase/migrations/20260922_lead_quiz_answers.sql`.
