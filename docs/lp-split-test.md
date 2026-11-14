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
