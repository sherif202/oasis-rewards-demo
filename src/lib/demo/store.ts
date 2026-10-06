import { useSyncExternalStore } from "react";
import { productById } from "./products";
import * as R from "./rules";

export type Lang = "en" | "ar";
export type Payment = "card" | "apple" | "cod";

export interface Credit {
  id: string;
  source: "late" | "missing";
  amount: number;
  remaining: number;
  issuedAt: number;
  expiresAt: number;
  orderId: string;
}
export interface OrderItem {
  pid: string;
  qty: number;
  price: number;
  missing?: "pending" | "approved" | "review" | undefined;
}
export interface Order {
  id: string;
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
  creditDiscount: number;
  perkDiscount: number;
  total: number;
  etaMin: number;
  actualMin?: number;
  forceLate?: boolean;
  status: "delivering" | "delivered" | "cancelled";
  deliveredAt?: number;
  slot: string;
  payment: Payment;
  makeGoodCreditId?: string | undefined;
  fullyRefunded?: boolean;
  refunded?: number;
}
export interface Notif {
  id: string;
  at: number;
  key: string;
  vars?: Record<string, string | number> | undefined;
  read?: boolean;
}
export interface Customer {
  id: string;
  name: string;
  nameAr: string;
  persona: string;
  group: "treatment" | "holdout";
  enrolled: boolean;
  optedOut: boolean;
  tier: R.TierId;
  graceUntil: number | null;
  orders: Order[];
  credits: Credit[];
  notifications: Notif[];
  basket: Record<string, number>;
  iftarDays: string[];
}
export interface Settings {
  perks: { makeGood: boolean; missingItem: boolean; streak: boolean; iftar: boolean; goldBasket: boolean };
  makeGoodCap: number;
  goldPerkCap: number;
  claimsBeforeReview: number;
  budgetCap: number;
  budgetSpent: number;
  stage: 1 | 2;
  ramadan: boolean;
  holdoutSplit: "85/15" | "70/30" | "50/50";
  iftarCapacity: number;
  iftarReserved: number;
}
export interface State {
  v: number;
  lang: Lang;
  currentId: string;
  customers: Customer[];
  settings: Settings;
  lastNightly: number | null;
}

const KEY = "oasis-regulars-demo-v1";
let uid = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

function mkOrder(oid: string, daysAgo: number, items: [string, number][], now: number, late = false): Order {
  const its = items.map(([pid, qty]) => ({ pid, qty, price: productById(pid).price }));
  const subtotal = its.reduce((s, i) => s + i.price * i.qty, 0);
  const created = now - daysAgo * R.DAY - 40 * R.MIN;
  return {
    id: oid,
    createdAt: created,
    items: its,
    subtotal,
    creditDiscount: 0,
    perkDiscount: 0,
    total: subtotal,
    etaMin: 22,
    actualMin: late ? 36 : 19,
    status: "delivered",
    deliveredAt: created + (late ? 36 : 19) * R.MIN,
    slot: "asap",
    payment: daysAgo % 2 ? "card" : "cod",
  };
}

export function seed(now = Date.now()): State {
  const laylaLate = mkOrder("OX-1042", 26, [["dates", 2], ["pampers", 1], ["water", 1], ["chicken", 1]], now, true);
  const layla: Customer = {
    id: "layla",
    name: "Layla",
    nameAr: "ليلى",
    persona: "gold",
    group: "treatment",
    enrolled: true,
    optedOut: false,
    tier: "gold",
    graceUntil: null,
    orders: [
      mkOrder("OX-1101", 2, [["rice", 2], ["chicken", 2], ["laban", 4], ["dates", 1]], now),
      mkOrder("OX-1088", 8, [["water", 2], ["milk", 3], ["eggs", 2], ["bread", 4], ["vimto", 2]], now),
      mkOrder("OX-1071", 14, [["pampers", 1], ["detergent", 1], ["tissues", 1]], now),
      mkOrder("OX-1056", 20, [["dates", 2], ["oil", 1], ["tomatoes", 2]], now),
      laylaLate,
      mkOrder("OX-0990", 33, [["rice", 1], ["chicken", 2], ["bread", 2]], now),
      mkOrder("OX-0961", 40, [["water", 2], ["eggs", 1], ["milk", 2]], now),
    ],
    credits: [
      {
        id: "cr-layla-1",
        source: "late",
        amount: 5,
        remaining: 5,
        issuedAt: laylaLate.deliveredAt!,
        expiresAt: laylaLate.deliveredAt! + R.CREDIT_DAYS * R.DAY,
        orderId: laylaLate.id,
      },
    ],
    notifications: [{ id: "n1", at: laylaLate.deliveredAt!, key: "notifLate", vars: { order: laylaLate.id } }],
    basket: { dates: 2, water: 2, laban: 3 },
    iftarDays: [],
  };
  laylaLate.makeGoodCreditId = "cr-layla-1";
  const ahmed: Customer = {
    id: "ahmed",
    name: "Ahmed",
    nameAr: "أحمد",
    persona: "silver",
    group: "treatment",
    enrolled: true,
    optedOut: false,
    tier: "silver",
    graceUntil: null,
    orders: [
      mkOrder("OX-1097", 3, [["pampers", 1], ["milk", 1], ["bread", 1]], now),
      mkOrder("OX-1077", 11, [["rice", 1], ["chicken", 1], ["eggs", 1], ["bread", 1], ["laban", 1]], now),
      mkOrder("OX-1060", 18, [["detergent", 1], ["oil", 1], ["bananas", 1], ["tomatoes", 1]], now),
    ],
    credits: [],
    notifications: [],
    basket: {},
    iftarDays: [],
  };
  const sara: Customer = {
    id: "sara",
    name: "Sara",
    nameAr: "سارة",
    persona: "light",
    group: "treatment",
    enrolled: false,
    optedOut: false,
    tier: "member",
    graceUntil: null,
    orders: [mkOrder("OX-1083", 9, [["water", 1], ["eggs", 1], ["bread", 1], ["laban", 1]], now)],
    credits: [],
    notifications: [],
    basket: {},
    iftarDays: [],
  };
  const omar: Customer = {
    id: "omar",
    name: "Omar",
    nameAr: "عمر",
    persona: "holdout",
    group: "holdout",
    enrolled: false,
    optedOut: false,
    tier: "member",
    graceUntil: null,
    orders: [
      mkOrder("OX-1092", 4, [["rice", 1], ["chicken", 1], ["tomatoes", 2]], now),
      mkOrder("OX-1068", 15, [["water", 1], ["milk", 2], ["bread", 2]], now),
    ],
    credits: [],
    notifications: [],
    basket: {},
    iftarDays: [],
  };
  return {
    v: 1,
    lang: "en",
    currentId: "layla",
    customers: [layla, ahmed, sara, omar],
    settings: {
      perks: { makeGood: true, missingItem: true, streak: true, iftar: true, goldBasket: true },
      makeGoodCap: 4,
      goldPerkCap: 2,
      claimsBeforeReview: 2,
      budgetCap: 60000,
      budgetSpent: 21400,
      stage: 1,
      ramadan: false,
      holdoutSplit: "85/15",
      iftarCapacity: 50,
      iftarReserved: 6,
    },
    lastNightly: null,
  };
}

// ---------- store plumbing ----------
let state: State = seed();
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};
const set = (fn: (s: State) => State) => {
  state = fn(state);
  emit();
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
    else state = seed();
  } catch {
    state = seed();
  }
  emit();
}
export const isHydrated = () => hydrated;
export function useDemo() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
export const getState = () => state;

// ---------- selectors ----------
export const current = (s: State) => s.customers.find((c) => c.id === s.currentId)!;
export const inProgramme = (c: Customer) => c.group === "treatment" && !c.optedOut;
export const basketTotal = (c: Customer) =>
  Object.entries(c.basket).reduce((s, [pid, q]) => s + productById(pid).price * q, 0);
export const monthCount = (c: Customer, now: number, pred: (cr: Credit) => boolean) =>
  c.credits.filter((cr) => pred(cr) && R.sameMonth(cr.issuedAt, now)).length;
export const goldUsesThisMonth = (c: Customer, now: number) =>
  c.orders.filter((o) => o.perkDiscount > 0 && R.sameMonth(o.createdAt, now)).length;
export const claimsThisMonth = (c: Customer, now: number) =>
  c.orders.flatMap((o) => o.items.filter((i) => i.missing).map(() => o)).filter((o) => R.sameMonth(o.createdAt, now))
    .length;
export const budgetLeft = (s: State) => s.settings.budgetCap - s.settings.budgetSpent;
export const todayKey = (now: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(now);

function updateCustomer(cid: string, fn: (c: Customer) => Customer) {
  set((s) => ({ ...s, customers: s.customers.map((c) => (c.id === cid ? fn(c) : c)) }));
}
const notify = (c: Customer, key: string, vars?: Notif["vars"]): Customer => ({
  ...c,
  notifications: [{ id: id("n"), at: Date.now(), key, vars }, ...c.notifications],
});

// ---------- actions ----------
export const actions = {
  reset() {
    state = seed();
    emit();
  },
  setLang(lang: Lang) {
    set((s) => ({ ...s, lang }));
  },
  setCurrent(currentId: string) {
    set((s) => ({ ...s, currentId }));
  },
  settings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  perk(key: keyof Settings["perks"], on: boolean) {
    set((s) => ({ ...s, settings: { ...s.settings, perks: { ...s.settings.perks, [key]: on } } }));
  },
  enrol(cid: string) {
    updateCustomer(cid, (c) => ({ ...c, enrolled: true, optedOut: false }));
  },
  optOut(cid: string) {
    updateCustomer(cid, (c) => ({ ...c, optedOut: true, enrolled: true }));
  },
  optIn(cid: string) {
    updateCustomer(cid, (c) => ({ ...c, optedOut: false }));
  },
  addToBasket(cid: string, pid: string, delta: number) {
    updateCustomer(cid, (c) => {
      const q = Math.max(0, (c.basket[pid] ?? 0) + delta);
      const basket = { ...c.basket, [pid]: q };
      if (!q) delete basket[pid];
      return { ...c, basket };
    });
  },
  readNotifs(cid: string) {
    updateCustomer(cid, (c) => ({ ...c, notifications: c.notifications.map((n) => ({ ...n, read: true })) }));
  },
  placeOrder(cid: string, opts: { slot: string; payment: Payment; etaMin: number; iftar: boolean }) {
    const s = state;
    const now = Date.now();
    const c = s.customers.find((x) => x.id === cid)!;
    const items = Object.entries(c.basket).map(([pid, qty]) => ({ pid, qty, price: productById(pid).price }));
    const subtotal = items.reduce((t, i) => t + i.price * i.qty, 0);
    const perk = R.goldPerkDiscount({
      stage: s.settings.stage,
      tier: c.tier,
      basket: subtotal,
      usesThisMonth: goldUsesThisMonth(c, now),
      cap: s.settings.goldPerkCap,
      enabled: s.settings.perks.goldBasket && budgetLeft(s) >= R.GOLD_PERK_AED,
      programme: inProgramme(c),
    });
    const { discount, usage } = R.applyCredits(c.credits, subtotal - perk, now);
    const order: Order = {
      id: `OX-${1200 + Math.floor(Math.random() * 8000)}`,
      createdAt: now,
      items,
      subtotal,
      creditDiscount: discount,
      perkDiscount: perk,
      total: subtotal - perk - discount,
      etaMin: opts.etaMin,
      status: "delivering",
      slot: opts.slot,
      payment: opts.payment,
    };
    set((st) => ({
      ...st,
      settings: {
        ...st.settings,
        budgetSpent: st.settings.budgetSpent + perk,
        iftarReserved: st.settings.iftarReserved + (opts.iftar ? 1 : 0),
      },
      customers: st.customers.map((x) =>
        x.id !== cid
          ? x
          : {
              ...x,
              basket: {},
              orders: [order, ...x.orders],
              iftarDays: opts.iftar ? [...x.iftarDays, todayKey(now)] : x.iftarDays,
              credits: x.credits.map((cr) => {
                const u = usage.find((u) => u.id === cr.id);
                return u ? { ...cr, remaining: cr.remaining - u.amount } : cr;
              }),
            },
      ),
    }));
    return order.id;
  },
  setForceLate(cid: string, oid: string, forceLate: boolean) {
    updateCustomer(cid, (c) => ({ ...c, orders: c.orders.map((o) => (o.id === oid ? { ...o, forceLate } : o)) }));
  },
  deliver(cid: string, oid: string, actualMin: number) {
    const s = state;
    const now = Date.now();
    const c = s.customers.find((x) => x.id === cid)!;
    const o = c.orders.find((x) => x.id === oid);
    if (!o || o.status === "delivered") return;
    const late = R.isLate(o.etaMin, actualMin);
    const eligible = R.makeGoodEligible({
      late,
      enabled: s.settings.perks.makeGood,
      monthCount: monthCount(c, now, (cr) => cr.source === "late"),
      cap: s.settings.makeGoodCap,
      alreadyCredited: !!o.makeGoodCreditId,
      budgetLeft: budgetLeft(s),
    });
    const credit: Credit | null = eligible
      ? {
          id: id("cr"),
          source: "late",
          amount: R.MAKE_GOOD_AED,
          remaining: R.MAKE_GOOD_AED,
          issuedAt: now,
          expiresAt: now + R.CREDIT_DAYS * R.DAY,
          orderId: oid,
        }
      : null;
    set((st) => ({
      ...st,
      settings: { ...st.settings, budgetSpent: st.settings.budgetSpent + (credit ? credit.amount : 0) },
      customers: st.customers.map((x) => {
        if (x.id !== cid) return x;
        let nx: Customer = {
          ...x,
          orders: x.orders.map((ord) =>
            ord.id === oid
              ? { ...ord, status: "delivered", actualMin, deliveredAt: now, makeGoodCreditId: credit?.id }
              : ord,
          ),
          credits: credit ? [credit, ...x.credits] : x.credits,
        };
        nx = notify(nx, "notifDelivered", { order: oid });
        if (credit) nx = notify(nx, "notifLate", { order: oid });
        return nx;
      }),
    }));
  },
  reportMissing(cid: string, oid: string, idx: number) {
    const now = Date.now();
    const c = state.customers.find((x) => x.id === cid)!;
    const outcome = R.missingClaimOutcome(claimsThisMonth(c, now), state.settings.claimsBeforeReview);
    const setItem = (status: OrderItem["missing"]) =>
      updateCustomer(cid, (x) => ({
        ...x,
        orders: x.orders.map((o) =>
          o.id === oid ? { ...o, items: o.items.map((it, i) => (i === idx ? { ...it, missing: status } : it)) } : o,
        ),
      }));
    if (outcome === "review") {
      setItem("review");
      updateCustomer(cid, (x) => notify(x, "notifReview", { order: oid }));
      return;
    }
    setItem("pending");
    setTimeout(() => {
      const s = state;
      const item = s.customers.find((x) => x.id === cid)!.orders.find((o) => o.id === oid)!.items[idx];
      if (!item) return;
      const refund = item.price * item.qty;
      const giveCredit = s.settings.perks.missingItem && budgetLeft(s) >= R.MISSING_CREDIT_AED;
      const t = Date.now();
      const credit: Credit | null = giveCredit
        ? {
            id: id("cr"),
            source: "missing",
            amount: R.MISSING_CREDIT_AED,
            remaining: R.MISSING_CREDIT_AED,
            issuedAt: t,
            expiresAt: t + R.CREDIT_DAYS * R.DAY,
            orderId: oid,
          }
        : null;
      set((st) => ({
        ...st,
        settings: { ...st.settings, budgetSpent: st.settings.budgetSpent + (credit ? credit.amount : 0) },
        customers: st.customers.map((x) =>
          x.id !== cid
            ? x
            : notify(
                {
                  ...x,
                  credits: credit ? [credit, ...x.credits] : x.credits,
                  orders: x.orders.map((o) =>
                    o.id === oid
                      ? {
                          ...o,
                          refunded: (o.refunded ?? 0) + refund,
                          items: o.items.map((it, i) => (i === idx ? { ...it, missing: "approved" } : it)),
                        }
                      : o,
                  ),
                },
                credit ? "notifMissing" : "notifRefund",
                { order: oid, amount: refund },
              ),
        ),
      }));
    }, 3000);
  },
  runNightly() {
    const now = Date.now();
    set((s) => ({
      ...s,
      lastNightly: now,
      customers: s.customers.map((c) => {
        if (c.group === "holdout") return c;
        const pts = R.points30(c.orders, now);
        const r = R.evaluateTier(c.tier, c.graceUntil, pts, now);
        let nc: Customer = { ...c, tier: r.tier, graceUntil: r.graceUntil };
        if (inProgramme(c)) {
          if (R.TIER_RANK[r.tier] > R.TIER_RANK[c.tier]) nc = notify(nc, "notifUp", { tier: r.tier });
          if (R.TIER_RANK[r.tier] < R.TIER_RANK[c.tier]) nc = notify(nc, "notifDown", { tier: r.tier });
          if (r.graceUntil && !c.graceUntil) nc = notify(nc, "notifGrace", {});
        }
        return nc;
      }),
    }));
  },
};
