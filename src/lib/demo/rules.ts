// Oasis Regulars programme rules — pure functions, unit tested in rules.test.ts
export const MIN = 60_000;
export const DAY = 86_400_000;
export const WEEK = 7 * DAY;

export type TierId = "member" | "silver" | "gold";
export const TIER_RANK: Record<TierId, number> = { member: 0, silver: 1, gold: 2 };
export const SILVER_AT = 40;
export const GOLD_AT = 80;
export const MIN_BASKET = 35;
export const LATE_GRACE_MIN = 10;
export const MAKE_GOOD_AED = 5;
export const MISSING_CREDIT_AED = 5;
export const CREDIT_DAYS = 30;
export const EXPIRY_REMINDER_DAYS = 5;
export const GRACE_DAYS = 30;
export const DEMOTION_NOTICE_DAYS = 7;
export const GOLD_PERK_AED = 9;
export const GOLD_PERK_MIN_BASKET = 150;
export const CLAIM_WINDOW_MS = 2 * 60 * MIN;
export const IFTAR_PROTECTED_SHARE = 0.2;

export function pointsForBasket(basket: number) {
  if (basket < MIN_BASKET) return { freq: 0, value: 0, total: 0 };
  const value = Math.floor(basket / 6);
  return { freq: 10, value, total: 10 + value };
}

export interface QualOrderLike {
  status: string;
  subtotal: number;
  fullyRefunded?: boolean;
  deliveredAt?: number;
}

export function isQualifying(o: QualOrderLike) {
  return o.status === "delivered" && !o.fullyRefunded && o.subtotal >= MIN_BASKET;
}

export function qualifyingInWindow<T extends QualOrderLike>(orders: T[], now: number) {
  return orders.filter(
    (o) => isQualifying(o) && o.deliveredAt != null && o.deliveredAt > now - 30 * DAY && o.deliveredAt <= now,
  );
}

export function points30(orders: QualOrderLike[], now: number) {
  return qualifyingInWindow(orders, now).reduce((s, o) => s + pointsForBasket(o.subtotal).total, 0);
}

export function tierFor(points: number): TierId {
  if (points >= GOLD_AT) return "gold";
  if (points >= SILVER_AT) return "silver";
  return "member";
}

export function nextTierInfo(points: number) {
  if (points >= GOLD_AT) return null;
  const target = points >= SILVER_AT ? GOLD_AT : SILVER_AT;
  const from = points >= SILVER_AT ? SILVER_AT : 0;
  return {
    next: (points >= SILVER_AT ? "gold" : "silver") as TierId,
    remaining: target - points,
    progress: (points - from) / (target - from),
  };
}

/** Nightly evaluation with one grace month before any demotion. */
export function evaluateTier(current: TierId, graceUntil: number | null, points: number, now: number) {
  const earned = tierFor(points);
  if (TIER_RANK[earned] >= TIER_RANK[current]) return { tier: earned, graceUntil: null };
  if (graceUntil == null) return { tier: current, graceUntil: now + GRACE_DAYS * DAY };
  if (now >= graceUntil) return { tier: earned, graceUntil: null };
  return { tier: current, graceUntil };
}

export function showDemotionNotice(graceUntil: number | null, now: number) {
  return graceUntil != null && graceUntil - now <= DEMOTION_NOTICE_DAYS * DAY && graceUntil > now;
}

const weekIdx = (t: number) => Math.floor((t + 4 * DAY) / WEEK); // weeks start Monday
const weekMonth = (w: number) => new Date(w * WEEK - 4 * DAY).toISOString().slice(0, 7);

/** Consecutive weeks with ≥1 qualifying order; 1 shield per calendar month covers one missed week. */
export function computeStreak(orderTimes: number[], now: number) {
  const weeks = new Set(orderTimes.map(weekIdx));
  let w = weekIdx(now);
  if (!weeks.has(w)) w--; // current week still open
  let streak = 0;
  const used = new Set<string>();
  for (let guard = 0; guard < 200; guard++) {
    if (weeks.has(w)) {
      streak++;
      w--;
      continue;
    }
    const m = weekMonth(w);
    if (streak > 0 && !used.has(m) && weeks.has(w - 1)) {
      used.add(m);
      w--;
      continue;
    }
    break;
  }
  const thisMonth = new Date(now).toISOString().slice(0, 7);
  return { streak, shieldsLeft: used.has(thisMonth) ? 0 : 1, shieldsUsed: used.size };
}

export function isLate(etaMin: number, actualMin: number) {
  return actualMin > etaMin + LATE_GRACE_MIN;
}

export function makeGoodEligible(p: {
  late: boolean;
  enabled: boolean;
  monthCount: number;
  cap: number;
  alreadyCredited: boolean;
  budgetLeft: number;
}) {
  return p.late && p.enabled && !p.alreadyCredited && p.monthCount < p.cap && p.budgetLeft >= MAKE_GOOD_AED;
}

/** Claims already made this month before this one; more than `limit` → manual review. */
export function missingClaimOutcome(priorClaimsThisMonth: number, limit = 2) {
  return priorClaimsThisMonth >= limit ? "review" : "approved";
}

export function goldPerkDiscount(p: {
  stage: 1 | 2;
  tier: TierId;
  basket: number;
  usesThisMonth: number;
  cap: number;
  enabled: boolean;
  programme: boolean;
}) {
  if (!p.programme || !p.enabled || p.stage !== 2 || p.tier !== "gold") return 0;
  if (p.basket < GOLD_PERK_MIN_BASKET || p.usesThisMonth >= p.cap) return 0;
  return GOLD_PERK_AED;
}

export function goldNudge(p: Omit<Parameters<typeof goldPerkDiscount>[0], "basket"> & { basket: number }) {
  if (!p.programme || !p.enabled || p.stage !== 2 || p.tier !== "gold" || p.usesThisMonth >= p.cap) return null;
  if (p.basket <= 0 || p.basket >= GOLD_PERK_MIN_BASKET) return null;
  return Math.round((GOLD_PERK_MIN_BASKET - p.basket) * 100) / 100;
}

export interface CreditLike {
  id: string;
  remaining: number;
  expiresAt: number;
}

export const isActiveCredit = (c: CreditLike, now: number) => c.remaining > 0 && c.expiresAt > now;

export function walletBalance(credits: CreditLike[], now: number) {
  return credits.filter((c) => isActiveCredit(c, now)).reduce((s, c) => s + c.remaining, 0);
}

/** Apply soonest-expiring credits first, capped at the amount due. */
export function applyCredits(credits: CreditLike[], due: number, now: number) {
  let left = due;
  const usage: { id: string; amount: number }[] = [];
  for (const c of [...credits].filter((c) => isActiveCredit(c, now)).sort((a, b) => a.expiresAt - b.expiresAt)) {
    if (left <= 0) break;
    const amt = Math.min(c.remaining, left);
    usage.push({ id: c.id, amount: amt });
    left -= amt;
  }
  return { discount: due - left, usage };
}

export function expiringSoon(credits: CreditLike[], now: number) {
  return credits.filter((c) => isActiveCredit(c, now) && c.expiresAt - now <= EXPIRY_REMINDER_DAYS * DAY);
}

export const protectedCapacity = (capacity: number) => Math.floor(capacity * IFTAR_PROTECTED_SHARE);
export const protectedReleased = (now: number, slotStart: number) => now >= slotStart - 60 * MIN;

export const sameMonth = (a: number, b: number) =>
  new Date(a).toISOString().slice(0, 7) === new Date(b).toISOString().slice(0, 7);
