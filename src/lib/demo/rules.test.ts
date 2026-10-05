import { describe, expect, it } from "vitest";
import * as R from "./rules";

const NOW = Date.UTC(2026, 9, 15, 12);

describe("Oasis Regulars rules", () => {
  it("basket under AED 35 earns nothing", () => {
    expect(R.pointsForBasket(34.99).total).toBe(0);
  });
  it("points = 10 + floor(basket / 6)", () => {
    expect(R.pointsForBasket(35)).toEqual({ freq: 10, value: 5, total: 15 });
    expect(R.pointsForBasket(84)).toEqual({ freq: 10, value: 14, total: 24 });
  });
  it("cancelled or fully refunded orders do not qualify", () => {
    expect(R.isQualifying({ status: "cancelled", subtotal: 100 })).toBe(false);
    expect(R.isQualifying({ status: "delivered", subtotal: 100, fullyRefunded: true })).toBe(false);
  });
  it("only last 30 days count", () => {
    const o = (d: number) => ({ status: "delivered", subtotal: 60, deliveredAt: NOW - d * R.DAY });
    expect(R.points30([o(1), o(31)], NOW)).toBe(20);
  });
  it("tier thresholds 40 / 80", () => {
    expect(R.tierFor(39)).toBe("member");
    expect(R.tierFor(40)).toBe("silver");
    expect(R.tierFor(80)).toBe("gold");
  });
  it("drop below tier starts one grace month, demotes after", () => {
    const g = R.evaluateTier("gold", null, 50, NOW);
    expect(g.tier).toBe("gold");
    expect(g.graceUntil).toBe(NOW + 30 * R.DAY);
    expect(R.evaluateTier("gold", g.graceUntil, 50, g.graceUntil!).tier).toBe("silver");
  });
  it("demotion notice shows within 7 days", () => {
    expect(R.showDemotionNotice(NOW + 8 * R.DAY, NOW)).toBe(false);
    expect(R.showDemotionNotice(NOW + 7 * R.DAY, NOW)).toBe(true);
  });
  it("late = more than ETA + 10 minutes", () => {
    expect(R.isLate(22, 32)).toBe(false);
    expect(R.isLate(22, 33)).toBe(true);
  });
  it("make-good capped at 4 per month", () => {
    const base = { late: true, enabled: true, cap: 4, alreadyCredited: false, budgetLeft: 100 };
    expect(R.makeGoodEligible({ ...base, monthCount: 3 })).toBe(true);
    expect(R.makeGoodEligible({ ...base, monthCount: 4 })).toBe(false);
  });
  it("third missing-item claim in a month goes to manual review", () => {
    expect(R.missingClaimOutcome(1)).toBe("approved");
    expect(R.missingClaimOutcome(2)).toBe("review");
  });
  it("Gold perk: AED 9 off ≥ AED 150 in Stage 2 only, max 2/month", () => {
    const p = { stage: 2 as const, tier: "gold" as const, basket: 150, usesThisMonth: 1, cap: 2, enabled: true, programme: true };
    expect(R.goldPerkDiscount(p)).toBe(9);
    expect(R.goldPerkDiscount({ ...p, stage: 1 })).toBe(0);
    expect(R.goldPerkDiscount({ ...p, usesThisMonth: 2 })).toBe(0);
    expect(R.goldNudge({ ...p, basket: 120 })).toBe(30);
  });
  it("expired credits are not applied", () => {
    const credits = [
      { id: "a", remaining: 5, expiresAt: NOW - 1 },
      { id: "b", remaining: 5, expiresAt: NOW + R.DAY },
    ];
    expect(R.applyCredits(credits, 20, NOW).discount).toBe(5);
  });
  it("protected iftar slots are 20% of capacity, release 60 min before", () => {
    expect(R.protectedCapacity(50)).toBe(10);
    expect(R.protectedReleased(NOW - 61 * R.MIN, NOW)).toBe(false);
    expect(R.protectedReleased(NOW - 60 * R.MIN, NOW)).toBe(true);
  });
  it("streak shield covers one missed week", () => {
    const t = (w: number) => NOW - w * R.WEEK;
    expect(R.computeStreak([t(0), t(1), t(3)], NOW).streak).toBe(3);
  });
});
