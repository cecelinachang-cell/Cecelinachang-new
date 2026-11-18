# Landing page split test: first screen A vs B

Started: the day this ships (Nov 2026). Page: `/lp/bakso-sapi-premium`. Code: `lib/lpSplit.ts`, `middleware.ts`, `components/landing/LandingHeroB.tsx`, `components/landing/LpArmTracker.tsx`.

## Why

Meta data for 6–14 Nov 2026 (all four Bakso ads, all sent to this page):

| Step | Count | Rate |
|---|---|---|
| Link clicks → landing page views | 762 → 601 | 79% |
| Landing page views → tapped "Bayar Sekarang" (InitiateCheckout) | 601 → 29 | **4.8%** |
| InitiateCheckout → Purchase | 29 → 11 | 38% |

About 80% of visitors never scroll a quarter of the page (LP_Scroll25 ≈ 18–20% of ViewContent). The sale is won or lost on the first screen.

## The two versions

Everything below the first screen is identical. The ad-matched headline (copy.adVariants) is the same in both.

- **A (control):** headline, handwritten student count, video, then the buy button.
- **B:** headline, then:
  - one line on who teaches it ("18 tahun punya pabrik bakso, 1998–2016");
  - the student count in plain bold;
  - the buy button;
  - one student's words (the "cucu" message);
  - a ticked "Yang kamu dapat" box.
  
  The video moves below this.

Each new visitor gets A or B at random, 50/50. Their version is kept in a cookie (`lp_ab`) for 30 days. The address bar always shows `/lp/bakso-sapi-premium`.

To look at a version yourself, add `?lp=a` or `?lp=b` to the URL. This also switches your cookie.

## How to read the result

In Meta Events Manager, open pixel `CeceLinaChang.com`, then Overview, and look at these custom events:

| Event | Meaning |
|---|---|
| `LP_View_A` / `LP_View_B` | a visitor saw version A / B |
| `LP_Checkout_A` / `LP_Checkout_B` | a visitor in A / B tapped through to the Lynk checkout |

- **Checkout rate per version:** `LP_Checkout_X ÷ LP_View_X`. This is the main number.
- **Sales:** the Lynk link carries `utm_term=lp-a` or `lp-b`. Purchases are too few to decide on: expect about 10 per version over two weeks.

## Rules

1. **Run 14 full days.** That gives about 450–550 views per version at Rp 110k/day, enough to see a 2× difference in checkout rate (4.8% → 9.6%) with confidence. A smaller difference needs weeks more.
2. **Don't change** price, ads, budgets or the page during the test.
3. **Stop early** only if, after ~250 views each, one version's checkout rate is under half the other's.
4. **Afterwards:** make the winner the only hero, and remove the slug from `LP_SPLIT_SLUGS`. With the set empty, everyone sees A.

## Version C: the plain page (in the test from 18 Nov 2026)

`components/landing/PlainLandingBody.tsx`. A whole page, not just a first screen, written for women 40-60 on a phone.

**From 18 Nov 2026 the test is A against C.** New visitors get A or C, 50/50 (`LP_DEALT_ARMS` in `lib/lpSplit.ts`). B is no longer dealt: after five days it was tied with A (6 checkouts from 184 views against 6 from 156), and it would have had to be twice as good to win. Visitors who already hold a B cookie keep seeing B until it expires (30 days), so `LP_View_B` keeps trickling in; leave B out of the A-against-C comparison.

Why C: the Meta pixel for 14-18 Nov showed about 1 visitor in 3 scrolling past the first quarter of the page, 7% playing the video, and about 3 in 4 of the people who tap "Bayar Sekarang" leaving the Lynk form without sending it.

What is different from A and B:

- The first screen says what the class is, the price, the button, one student's words, then "Cara daftar": what the Lynk form asks for (name, email, WhatsApp number, Gmail address), the payment choices, and how the class arrives.
- About half the length (7.7 phone screens against 15.3). No quiz, pain list, root-cause, factory story, before/after or equipment sections.
- Body text is 18px or larger. No handwriting font. FAQ answers are shown open, with no tap needed.
- The video sits lower, under "Kenalan dulu sama Cece".
- The cookie notice is one row on this page (`components/CookieNotice.tsx`).

How to read it: `LP_Checkout_A ÷ LP_View_A` against `LP_Checkout_C ÷ LP_View_C`, counting from 18 Nov 2026 only. Lynk orders carry `utm_term=lp-a` or `lp-c`. The same rules apply as above: 14 full days (to 2 Dec 2026), no price, ad or page changes meanwhile, stop early only if after about 250 views each one version's rate is under half the other's.

To look at a version yourself: `/lp/bakso-sapi-premium?lp=a`, `?lp=b` or `?lp=c` (this also switches your cookie).
