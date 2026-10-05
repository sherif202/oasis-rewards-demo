# Oasis Rewards Demo

Build a clickable MVP demo called "Oasis Regulars" for Oasis Express, a quick-commerce grocery app in Dubai (UAE) that delivers essentials in ~22 minutes. Oasis Regulars is a FREE, earned-status loyalty programme (no fees, ever) piloted in one Dubai zone, plus automatic "Make-Good" credits when an order arrives late. It rewards both order frequency and basket value (50/50). This is a demo: all data is simulated, stored in the browser only (no backend, no real auth, no real payments). Show a persistent, clearly visible label "Demo — simulated data".

USERS / ROLES (switch via a top navigation): 1) Customer app (render inside a phone-sized frame on desktop, full width on mobile). 2) Support console (desktop). 3) Pilot operator console (desktop).

LANGUAGE & STYLE: Full Arabic (right-to-left layout) and English with a language toggle; Arabic must mirror the layout correctly. Currency AED, Gulf Standard Time. Warm, trustworthy, family-friendly, clean (not flashy). Tier names: Member / Silver / Gold (Arabic: عضو / فضي / ذهبي). Tone: honest and plain — "No fees, ever. Every order counts." and "Late? We'll make it good, automatically." WCAG AA contrast; never show tier by colour alone (always icon + text).

PROGRAMME RULES (implement exactly):
- Qualifying order = completed, not cancelled/fully refunded, basket ≥ AED 35.
- Status points per qualifying order = 10 (frequency) + 1 point per AED 6 of basket (value), rounded down. Points are counted over a rolling 30 days.
- Tiers: Member 0–39, Silver ≥ 40, Gold ≥ 80. If points fall below the current tier, the customer keeps the tier for one grace month; show a demotion notice 7 days before any demotion.
- Weekly streak: counts consecutive weeks with ≥1 qualifying order; 1 "shield" per month auto-covers one missed week.
- Make-Good (applies to ALL zone customers, including the hold-out group): if delivered time > ETA shown at checkout + 10 minutes, automatically add a non-cash credit of AED 5 within the flow, max 1 per order and 4 per customer per month, with an in-app notification.
- Missing item: customer reports within 2 hours in one tap; after rider confirmation (simulated, auto-approves after 3 seconds) they get the item refund + AED 5 credit; more than 2 claims in a month → "sent to manual review" instead.
- Credits: non-cash, non-transferable, expire after 30 days, applied as a basket discount at checkout for any payment method including cash on delivery. Expiry reminder 5 days before.
- Stage 1 vs Stage 2 (operator switch): Stage 2 adds one Gold perk: AED 9 off baskets ≥ AED 150, max 2 times per month. In Stage 2 show a basket nudge ("Add AED X to unlock your Gold AED 9 perk").
- Protected iftar slots: in Ramadan mode, Gold customers can reserve a protected pre-iftar slot (17:00–18:30), max 1 per day; protected slots are at most 20% of slot capacity; unused protected slots release to everyone 60 minutes before.
- Hold-out customers see NO programme UI (no tiers, points, streak, perks) but DO get Make-Good credits.

CUSTOMER APP SCREENS & ACCEPTANCE CRITERIA:
1) Welcome / enrolment notice: shown before first tier display; explains the programme, data use, and that features may vary by customer during a trial; has an "Opt out of Oasis Regulars" option (opting out removes the status layer for that customer).
2) Home: tier card (icon + name), points in last 30 days, "X points to next tier" progress bar, streak with shield count, wallet balance. (Given treatment customer, When opening Home, Then tier, points and progress are shown in AR/EN.)
3) Shop & basket: ~15 Dubai essentials with AED prices (e.g., Al Ain water 12×1.5L AED 15, Pampers diapers size 4 AED 69, basmati rice 5kg AED 32, Al Rawabi milk 2L AED 11, eggs 30 AED 22, Arabic bread AED 4, dates 1kg AED 35, laban AED 6, olive oil 1L AED 28, chicken 1kg AED 26, tissues 5-pack AED 18, detergent AED 39, bananas 1kg AED 7, tomatoes 1kg AED 6, Vimto concentrate AED 14). Basket shows live "This order earns +N points" preview and the Stage 2 nudge.
4) Checkout: delivery slot picker (ASAP with ETA, or scheduled slots; protected iftar slots for Gold in Ramadan mode), payment method selector (card, Apple Pay, cash on delivery — nothing is charged), credits/perks applied as a discount, and a per-order savings summary.
5) Order tracking: simulated delivery with countdown to the checkout ETA; a demo toggle "Make this delivery late" makes it arrive >10 min after ETA; on delivery, if late, the AED 5 credit is added automatically with a notification.
6) Order received: list of items with "Report missing item" flow as above.
7) Wallet & savings ledger: credits with source (late delivery / missing item), amount, expiry; per-order ledger of points earned, credits and perks applied.
8) Status details: 30-day points history (date, order, frequency points, value points), grace-month status, demotion notice.

SUPPORT CONSOLE: 9) Customer lookup: search/select a customer; see tier, 30-day points history, grace status, credits issued and redeemed, claims count, and copyable reply macros for "Why did my tier change?", "Where is my credit?", "Why doesn't my friend have this?".

OPERATOR CONSOLE:
10) Pilot dashboard comparing Treatment vs Hold-out with seeded simulated data: Repeat orders per active user (hold-out 1.80, treatment 2.02, with 95% confidence interval), monthly retention (72% vs 74.5%, labelled "directional"), share of baskets ≥ AED 150 (11% vs 15%), share reaching Silver (31%), late orders auto-credited (93%). Guardrails with green/amber/red status + icon + text: reward cost per redeemed order (≤ AED 9.18), profit per order vs hold-out (≥ hold-out − AED 0.90), order splitting, missing-item claim rate (≤ 3%; showing 1.5%), support tickets per 1,000 orders, rider on-time rate and delivery-time parity between groups (dispatch is blind to membership). Budget meter: AED 21,400 spent of AED 60,000 cap.
11) Perk settings: on/off kill switch per perk (Make-Good late credit, missing-item credit, streak, iftar slots, Stage 2 Gold basket perk), per-customer caps, total budget cap, Stage 1/Stage 2 switch, Ramadan mode switch, hold-out split setting (85/15, 70/30, 50/50). Turning a perk off must immediately remove it from the customer app.

DEMO CONTROLS BAR (always visible, labelled "Demo — simulated data"): customer switcher with 4 seeded personas — Layla (Gold, Ramadan host, 5 orders in last 30 days), Ahmed (Silver, 8 points short of Gold), Sara (light user, Member, 1 order), Omar (hold-out group: sees no programme but gets Make-Good credits); "Run nightly points update" button that recalculates points/tiers from orders; Ramadan mode toggle; Stage 1/2 toggle; reset demo data.

DO NOT BUILD: paid membership or any fee, free-delivery perk, partner/bank points, AI or personalised offers, B2B team accounts, other countries, shared household status, real login, real dispatch or payments, backend database.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe37dcb3-dfca-4042-b10e-31052e41a584).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
