import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronLeft,
  Flame,
  Home,
  Minus,
  Plus,
  Receipt,
  ShoppingBasket,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { actions, current, inProgramme, useDemo, basketTotal, goldUsesThisMonth, budgetLeft, todayKey } from "@/lib/demo/store";
import type { Customer, Order } from "@/lib/demo/store";
import * as R from "@/lib/demo/rules";
import { fmtAED, fmtDate, fmtNum, t } from "@/lib/demo/i18n";
import { products, productById } from "@/lib/demo/products";
import { Btn, Card, Progress, TierBadge } from "./ui";
import { cn } from "@/lib/utils";

type Screen = "home" | "shop" | "basket" | "tracking" | "received" | "wallet" | "status";

export function CustomerApp() {
  const s = useDemo();
  const c = current(s);
  const [screen, setScreen] = useState<Screen>("home");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => setScreen("home"), [s.currentId]);

  const activeOrder = c.orders.find((o) => o.status === "delivering");

  const go = (sc: Screen) => setScreen(sc);
  const placed = (oid: string) => {
    setLastOrderId(oid);
    setScreen("tracking");
  };

  return (
    <div className="phone-frame mx-auto flex h-full w-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {!c.enrolled ? (
          <Welcome c={c} />
        ) : screen === "home" ? (
          <HomeScreen c={c} go={go} />
        ) : screen === "shop" ? (
          <ShopScreen c={c} go={go} />
        ) : screen === "basket" ? (
          <CheckoutScreen c={c} go={go} placed={placed} />
        ) : screen === "tracking" && activeOrder ? (
          <TrackingScreen c={c} o={activeOrder} go={go} />
        ) : screen === "tracking" ? (
          <HomeScreen c={c} go={go} />
        ) : screen === "received" ? (
          <ReceivedScreen c={c} oid={lastOrderId} go={go} />
        ) : screen === "wallet" ? (
          <WalletScreen c={c} />
        ) : (
          <StatusScreen c={c} />
        )}
      </div>
      {c.enrolled && (
        <nav className="flex items-center justify-around border-t bg-card px-2 py-1.5">
          {(
            [
              ["home", Home, "home"],
              ["shop", Store, "shop"],
              ["basket", ShoppingBasket, "basket"],
              ["wallet", Wallet, "wallet"],
              ["status", Sparkles, "status"],
            ] as const
          ).map(([sc, I, k]) => (
            <button
              key={sc}
              onClick={() => go(sc)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium",
                screen === sc ? "text-primary" : "text-muted-foreground",
              )}
            >
              <I className="size-5" aria-hidden />
              {t(s.lang, k)}
              {sc === "basket" && Object.keys(c.basket).length > 0 && (
                <span className="absolute -mt-1 ms-8 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {Object.values(c.basket).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

function Welcome({ c }: { c: Customer }) {
  const s = useDemo();
  const L = s.lang;
  return (
    <div className="flex min-h-full flex-col justify-center gap-4 p-6">
      <div className="rounded-3xl bg-hero p-6 text-primary-foreground shadow-soft">
        <Sparkles className="mb-3 size-8" aria-hidden />
        <h1 className="text-2xl font-bold">{t(L, "welcomeTitle")}</h1>
        <p className="mt-1 text-sm opacity-90">{t(L, "tagline")}</p>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{t(L, "welcomeBody")}</p>
      <Card className="space-y-2 text-sm">
        <p className="font-semibold text-success">{t(L, "welcomeFree")}</p>
        <p className="text-muted-foreground">{t(L, "welcomeData")}</p>
        <p className="text-muted-foreground">{t(L, "welcomeTrial")}</p>
        <p className="text-muted-foreground">{t(L, "makeGoodLine")}</p>
      </Card>
      <Btn onClick={() => actions.enrol(c.id)}>{t(L, "welcomeCta")}</Btn>
      <button onClick={() => actions.optOut(c.id)} className="text-xs text-muted-foreground underline">
        {t(L, "optOut")} — {t(L, "optOutNote")}
      </button>
    </div>
  );
}

function HomeScreen({ c, go }: { c: Customer; go: (s: Screen) => void }) {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const pts = R.points30(c.orders, now);
  const next = R.nextTierInfo(pts);
  const streak = R.computeStreak(
    c.orders.filter((o) => R.isQualifying(o)).map((o) => o.deliveredAt ?? o.createdAt),
    now,
  );
  const balance = R.walletBalance(c.credits, now);
  const expiring = R.expiringSoon(c.credits, now);
  const activeOrder = c.orders.find((o) => o.status === "delivering");
  const unread = c.notifications.filter((n) => !n.read).length;
  const [showNotifs, setShowNotifs] = useState(false);
  const programme = inProgramme(c);

  if (c.group === "holdout") {
    return (
      <div className="space-y-4 p-4">
        <div className="rounded-3xl bg-hero p-6 text-primary-foreground shadow-soft">
          <h1 className="text-xl font-bold">{t(L, "holdoutHome")}</h1>
          <p className="mt-1 text-sm opacity-90">{t(L, "hello", { name: L === "ar" ? c.nameAr : c.name })}</p>
        </div>
        {balance > 0 && (
          <Card>
            <p className="text-sm font-semibold">
              {t(L, "walletBalance")}: {fmtAED(balance, L)}
            </p>
          </Card>
        )}
        <Btn onClick={() => go("shop")}>
          <Store className="size-4" aria-hidden /> {t(L, "shop")}
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t(L, "hello", { name: L === "ar" ? c.nameAr : c.name })}</p>
          {programme && <TierBadge tier={c.tier} lang={L} size="lg" />}
        </div>
        <button
          onClick={() => {
            setShowNotifs(!showNotifs);
            if (!showNotifs) actions.readNotifs(c.id);
          }}
          className="relative rounded-full border bg-card p-2.5"
          aria-label={t(L, "notifications")}
        >
          <Bell className="size-5" aria-hidden />
          {unread > 0 && <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-destructive" />}
        </button>
      </div>

      {showNotifs && (
        <Card className="space-y-2">
          <p className="text-sm font-semibold">{t(L, "notifications")}</p>
          {c.notifications.length === 0 && <p className="text-sm text-muted-foreground">{t(L, "noNotifs")}</p>}
          {c.notifications.slice(0, 6).map((n) => (
            <p key={n.id} className="border-b pb-1.5 text-sm last:border-0">
              {t(L, n.key as never, n.vars)} <span className="text-xs text-muted-foreground">{fmtDate(n.at, L, true)}</span>
            </p>
          ))}
        </Card>
      )}

      {c.optedOut && (
        <Card className="flex items-center justify-between gap-2">
          <p className="text-sm">{t(L, "optedOutBanner")}</p>
          <Btn variant="outline" onClick={() => actions.optIn(c.id)}>
            {t(L, "optBackIn")}
          </Btn>
        </Card>
      )}

      {activeOrder && (
        <Card className="flex items-center justify-between gap-2 border-primary/40 bg-accent">
          <p className="text-sm font-semibold">{t(L, "activeOrder")}</p>
          <Btn variant="soft" onClick={() => go("tracking")}>
            {t(L, "track")}
          </Btn>
        </Card>
      )}

      {programme && (
        <>
          {c.graceUntil != null &&
            (R.showDemotionNotice(c.graceUntil, now) ? (
              <Card className="border-warning/50 bg-warning-soft">
                <p className="text-sm font-semibold text-warning">
                  {t(L, "demotionTitle", { days: Math.ceil((c.graceUntil - now) / R.DAY) })}
                </p>
                <p className="text-sm">
                  {t(L, "demotionBody", {
                    n: Math.max(0, (c.tier === "gold" ? R.GOLD_AT : R.SILVER_AT) - pts),
                    date: fmtDate(c.graceUntil, L),
                    tier: t(L, c.tier),
                  })}
                </p>
              </Card>
            ) : (
              <Card className="border-warning/50 bg-warning-soft">
                <p className="text-sm font-semibold text-warning">{t(L, "graceTitle")}</p>
                <p className="text-sm">{t(L, "graceBody", { tier: t(L, c.tier), date: fmtDate(c.graceUntil, L) })}</p>
              </Card>
            ))}

          <Card>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-primary">{fmtNum(pts, L)}</p>
              <p className="text-xs text-muted-foreground">{t(L, "pointsLast30")}</p>
            </div>
            {next ? (
              <div className="mt-3 space-y-1.5">
                <Progress value={next.progress} />
                <p className="text-xs text-muted-foreground">{t(L, "toNext", { n: next.remaining, tier: t(L, next.next) })}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-gold">{t(L, "topTier")}</p>
            )}
          </Card>

          {s.settings.perks.streak && (
            <Card className="flex items-center gap-3">
              <Flame className="size-6 text-warning" aria-hidden />
              <div>
                <p className="text-sm font-semibold">
                  {t(L, "streak")}: {t(L, "weeks", { n: streak.streak })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {streak.shieldsLeft > 0 ? t(L, "shields", { n: streak.shieldsLeft }) : t(L, "shieldsNone")}
                </p>
              </div>
            </Card>
          )}
        </>
      )}

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{t(L, "walletBalance")}</p>
          <p className="text-xl font-bold">{fmtAED(balance, L)}</p>
          {expiring.map((cr) => (
            <p key={cr.id} className="text-xs text-warning">
              {t(L, "expiring", { amount: cr.remaining, date: fmtDate(cr.expiresAt, L) })}
            </p>
          ))}
        </div>
        <Btn variant="outline" onClick={() => go("wallet")}>
          {t(L, "wallet")}
        </Btn>
      </Card>

      <Btn onClick={() => go("shop")} className="w-full">
        <Store className="size-4" aria-hidden /> {t(L, "shop")}
      </Btn>
    </div>
  );
}

function ShopScreen({ c, go }: { c: Customer; go: (s: Screen) => void }) {
  const s = useDemo();
  const L = s.lang;
  const total = basketTotal(c);
  const pts = R.pointsForBasket(total);
  const nudge = R.goldNudge({
    stage: s.settings.stage,
    tier: c.tier,
    basket: total,
    usesThisMonth: goldUsesThisMonth(c, Date.now()),
    cap: s.settings.goldPerkCap,
    enabled: s.settings.perks.goldBasket && budgetLeft(s) >= R.GOLD_PERK_AED,
    programme: inProgramme(c),
  });
  return (
    <div className="space-y-3 p-4 pb-24">
      <h1 className="text-lg font-bold">{t(L, "shop")}</h1>
      {nudge != null && (
        <Card className="border-gold/50 bg-gold-soft text-sm font-medium text-gold">
          {t(L, "goldNudge", { amount: nudge })}
        </Card>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {products.map((p) => {
          const q = c.basket[p.id] ?? 0;
          return (
            <Card key={p.id} className="flex flex-col gap-1 p-3">
              <span className="text-2xl" aria-hidden>
                {p.emoji}
              </span>
              <p className="text-sm font-medium leading-tight">{L === "ar" ? p.ar : p.en}</p>
              <p className="text-sm font-bold text-primary">{fmtAED(p.price, L)}</p>
              {q === 0 ? (
                <Btn variant="soft" className="mt-1 px-2 py-1.5 text-xs" onClick={() => actions.addToBasket(c.id, p.id, 1)}>
                  <Plus className="size-3.5" aria-hidden /> {t(L, "add")}
                </Btn>
              ) : (
                <div className="mt-1 flex items-center justify-between rounded-xl bg-muted px-1 py-1">
                  <button onClick={() => actions.addToBasket(c.id, p.id, -1)} className="rounded-lg p-1 hover:bg-card" aria-label="minus">
                    <Minus className="size-4" />
                  </button>
                  <span className="text-sm font-bold">{q}</span>
                  <button onClick={() => actions.addToBasket(c.id, p.id, 1)} className="rounded-lg p-1 hover:bg-card" aria-label="plus">
                    <Plus className="size-4" />
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {total > 0 && (
        <div className="sticky bottom-2">
          <button onClick={() => go("basket")} className="w-full rounded-2xl bg-primary p-3.5 text-primary-foreground shadow-soft">
            <span className="flex items-center justify-between text-sm font-semibold">
              <span>
                {t(L, "basket")} · {fmtAED(total, L)}
              </span>
              {inProgramme(c) && pts.total > 0 && <span>{t(L, "earns", { n: pts.total })}</span>}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function CheckoutScreen({ c, go, placed }: { c: Customer; go: (s: Screen) => void; placed: (oid: string) => void }) {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const subtotal = basketTotal(c);
  const [slot, setSlot] = useState("asap");
  const [payment, setPayment] = useState<"card" | "apple" | "cod">("card");
  const programme = inProgramme(c);
  const perk = R.goldPerkDiscount({
    stage: s.settings.stage,
    tier: c.tier,
    basket: subtotal,
    usesThisMonth: goldUsesThisMonth(c, now),
    cap: s.settings.goldPerkCap,
    enabled: s.settings.perks.goldBasket && budgetLeft(s) >= R.GOLD_PERK_AED,
    programme,
  });
  const { discount } = R.applyCredits(c.credits, subtotal - perk, now);
  const pts = R.pointsForBasket(subtotal);
  const protectedCap = R.protectedCapacity(s.settings.iftarCapacity);
  const protectedLeft = protectedCap - s.settings.iftarReserved;
  const usedToday = c.iftarDays.includes(todayKey(now));
  const canIftar =
    s.settings.ramadan && s.settings.perks.iftar && programme && c.tier === "gold" && protectedLeft > 0 && !usedToday;
  const iftar = slot === "iftar";

  if (subtotal === 0)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <ShoppingBasket className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-muted-foreground">{t(L, "emptyBasket")}</p>
        <Btn variant="outline" onClick={() => go("shop")}>
          {t(L, "shop")}
        </Btn>
      </div>
    );

  return (
    <div className="space-y-3 p-4">
      <button onClick={() => go("shop")} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden /> {t(L, "shop")}
      </button>
      <h1 className="text-lg font-bold">{t(L, "checkout")}</h1>

      <Card className="space-y-1.5">
        {Object.entries(c.basket).map(([pid, q]) => (
          <p key={pid} className="flex justify-between text-sm">
            <span>
              {L === "ar" ? productById(pid).ar : productById(pid).en} × {q}
            </span>
            <span>{fmtAED(productById(pid).price * q, L)}</span>
          </p>
        ))}
      </Card>

      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t(L, "deliverySlot")}</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={slot === "asap"} onChange={() => setSlot("asap")} />
          {t(L, "asap", { n: 22 })}
        </label>
        {s.settings.ramadan && s.settings.perks.iftar && (
          <label className={cn("flex items-center gap-2 text-sm", !canIftar && "opacity-50")}>
            <input type="radio" disabled={!canIftar} checked={iftar} onChange={() => setSlot("iftar")} />
            {t(L, "protectedSlot")}
          </label>
        )}
        {s.settings.ramadan && s.settings.perks.iftar && programme && c.tier === "gold" && (
          <p className="text-xs text-muted-foreground">
            {usedToday ? t(L, "protectedUsed") : t(L, "protectedLeft", { n: Math.max(0, protectedLeft), cap: protectedCap })}
          </p>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t(L, "payment")}</p>
        <div className="flex gap-2">
          {(["card", "apple", "cod"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPayment(p)}
              aria-pressed={payment === p}
              className={cn(
                "flex-1 rounded-xl border px-2 py-2 text-xs font-medium",
                payment === p ? "border-primary bg-accent text-accent-foreground" : "bg-card",
              )}
            >
              {t(L, p)}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t(L, "nothingCharged")}</p>
      </Card>

      <Card className="space-y-1.5 text-sm">
        <p className="flex justify-between">
          <span>{t(L, "subtotal")}</span>
          <span>{fmtAED(subtotal, L)}</span>
        </p>
        {perk > 0 && (
          <p className="flex justify-between font-medium text-gold">
            <span>{t(L, "goldPerk")}</span>
            <span>−{fmtAED(perk, L)}</span>
          </p>
        )}
        {discount > 0 && (
          <p className="flex justify-between text-success">
            <span>{t(L, "credits")}</span>
            <span>−{fmtAED(discount, L)}</span>
          </p>
        )}
        <p className="flex justify-between border-t pt-1.5 text-base font-bold">
          <span>{t(L, "total")}</span>
          <span>{fmtAED(subtotal - perk - discount, L)}</span>
        </p>
        {perk + discount > 0 && <p className="text-xs font-medium text-success">{t(L, "savings", { amount: perk + discount })}</p>}
        {perk > 0 && <p className="text-xs text-gold">{t(L, "goldUnlocked")}</p>}
        {programme &&
          (pts.total > 0 ? (
            <p className="text-xs text-muted-foreground">
              {t(L, "earns", { n: pts.total })} · {t(L, "earnsDetail", { v: pts.value })}
            </p>
          ) : (
            <p className="text-xs text-warning">{t(L, "notQualifying", { amount: R.MIN_BASKET - subtotal })}</p>
          ))}
      </Card>

      <Btn className="w-full" onClick={() => placed(actions.placeOrder(c.id, { slot, payment, etaMin: 22, iftar }))}>
        {t(L, "placeOrder")}
      </Btn>
    </div>
  );
}

function TrackingScreen({ c, o, go }: { c: Customer; o: Order; go: (s: Screen) => void }) {
  const s = useDemo();
  const L = s.lang;
  const [elapsed, setElapsed] = useState(0);
  const forceLate = o.forceLate ?? false;
  useEffect(() => {
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  const shown = Math.max(elapsed, 1);
  const remaining = o.etaMin - shown;
  const overdue = shown - o.etaMin;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-bold">{t(L, "tracking")}</h1>
      <div className="grid size-40 place-items-center rounded-full border-8 border-accent bg-card shadow-soft">
        {overdue <= 0 ? (
          <div>
            <p className="text-4xl font-bold text-primary">{Math.max(remaining, 1)}</p>
            <p className="text-xs text-muted-foreground">{t(L, "min")}</p>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold text-warning">+{overdue}</p>
            <p className="text-xs text-muted-foreground">{t(L, "min")}</p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {overdue <= 0 ? t(L, "arrivingIn") : t(L, "overdue", { n: overdue })} · {t(L, "etaWas", { n: o.etaMin })}
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={forceLate} onChange={(e) => actions.setForceLate(c.id, o.id, e.target.checked)} />
        {t(L, "makeLate")}
      </label>
      <p className="text-xs text-muted-foreground">{t(L, "makeLateHint")}</p>
      <Btn onClick={() => actions.deliver(c.id, o.id, forceLate ? o.etaMin + 14 : Math.max(shown, o.etaMin - 3))}>
        {t(L, "skip")}
      </Btn>
      {o.status === "delivered" && go("received" as never) as never}
      <p className="text-xs text-muted-foreground">{t(L, "simNote")}</p>
    </div>
  );
}

function ReceivedScreen({ c, oid, go }: { c: Customer; oid: string | null; go: (s: Screen) => void }) {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const o = c.orders.find((x) => x.id === oid) ?? c.orders.find((x) => x.status === "delivered");
  if (!o) return <HomeScreen c={c} go={go} />;
  const late = o.actualMin != null && R.isLate(o.etaMin, o.actualMin);
  const credited = !!o.makeGoodCreditId;
  const claimOpen = o.deliveredAt != null && now - o.deliveredAt <= R.CLAIM_WINDOW_MS;
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-3xl bg-hero p-6 text-center text-primary-foreground shadow-soft">
        <Receipt className="mx-auto mb-2 size-8" aria-hidden />
        <h1 className="text-xl font-bold">{t(L, "received")}</h1>
        {o.actualMin != null && <p className="mt-1 text-sm opacity-90">{t(L, "deliveredIn", { n: o.actualMin, eta: o.etaMin })}</p>}
      </div>
      {late && (
        <Card className={credited ? "border-success/50 bg-success-soft" : "border-warning/50 bg-warning-soft"}>
          <p className="text-sm font-semibold">{credited ? t(L, "lateCredited") : t(L, "lateNoCredit")}</p>
        </Card>
      )}
      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t(L, "reportMissing")}</p>
        <p className="text-xs text-muted-foreground">{claimOpen ? t(L, "claimWindow") : t(L, "claimClosed")}</p>
        {o.items.map((it, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>
              {L === "ar" ? productById(it.pid).ar : productById(it.pid).en} × {it.qty}
            </span>
            {it.missing === "pending" ? (
              <span className="text-xs text-muted-foreground">{t(L, "claimPending")}</span>
            ) : it.missing === "approved" ? (
              <span className="text-xs font-medium text-success">
                {c.credits.some((cr) => cr.orderId === o.id && cr.source === "missing")
                  ? t(L, "claimApproved")
                  : t(L, "claimApprovedNoCredit")}
              </span>
            ) : it.missing === "review" ? (
              <span className="text-xs font-medium text-warning">{t(L, "claimReview")}</span>
            ) : (
              <Btn
                variant="outline"
                className="px-2 py-1 text-xs"
                disabled={!claimOpen}
                onClick={() => actions.reportMissing(c.id, o.id, i)}
              >
                {t(L, "reportMissing")}
              </Btn>
            )}
          </div>
        ))}
      </Card>
      <Btn className="w-full" onClick={() => go("home")}>
        {t(L, "backHome")}
      </Btn>
    </div>
  );
}

function WalletScreen({ c }: { c: Customer }) {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const balance = R.walletBalance(c.credits, now);
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold">{t(L, "wallet")}</h1>
      <Card>
        <p className="text-xs text-muted-foreground">{t(L, "walletBalance")}</p>
        <p className="text-3xl font-bold text-primary">{fmtAED(balance, L)}</p>
      </Card>
      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t(L, "creditsList")}</p>
        {c.credits.length === 0 && <p className="text-sm text-muted-foreground">{t(L, "noCredits")}</p>}
        {c.credits.map((cr) => {
          const expired = cr.expiresAt <= now;
          const usedUp = cr.remaining <= 0;
          return (
            <div key={cr.id} className="flex items-center justify-between border-b pb-1.5 text-sm last:border-0">
              <div>
                <p className="font-medium">{t(L, cr.source === "late" ? "srcLate" : "srcMissing")}</p>
                <p className="text-xs text-muted-foreground">
                  {expired ? t(L, "expired") : usedUp ? t(L, "used") : t(L, "expires", { date: fmtDate(cr.expiresAt, L) })}
                </p>
              </div>
              <span className={cn("font-bold", expired || usedUp ? "text-muted-foreground line-through" : "text-success")}>
                {usedUp || expired ? fmtAED(cr.amount, L) : t(L, "remaining", { amount: cr.remaining })}
              </span>
            </div>
          );
        })}
        <p className="pt-1 text-xs text-muted-foreground">{t(L, "creditRules")}</p>
      </Card>
      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t(L, "ledger")}</p>
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-xs">
          <span className="font-semibold text-muted-foreground">{t(L, "order")}</span>
          <span className="font-semibold text-muted-foreground">{t(L, "creditsApplied")}</span>
          <span className="font-semibold text-muted-foreground">{t(L, "creditEarned")}</span>
          {c.orders.slice(0, 10).map((o) => {
            const earned = c.credits.filter((cr) => cr.orderId === o.id).reduce((sum, cr) => sum + cr.amount, 0);
            return (
              <LedgerRow key={o.id} o={o} earned={earned} L={L} />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function LedgerRow({ o, earned, L }: { o: Order; earned: number; L: "en" | "ar" }) {
  return (
    <>
      <span>
        {o.id} · {fmtDate(o.createdAt, L)}
      </span>
      <span>{o.creditDiscount + o.perkDiscount > 0 ? fmtAED(o.creditDiscount + o.perkDiscount, L) : "—"}</span>
      <span>{earned > 0 ? fmtAED(earned, L) : "—"}</span>
    </>
  );
}

function StatusScreen({ c }: { c: Customer }) {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const programme = inProgramme(c);
  const rows = useMemo(
    () =>
      R.qualifyingInWindow(c.orders, now).map((o) => ({
        o,
        pts: R.pointsForBasket(o.subtotal),
      })),
    [c.orders, now],
  );
  if (!programme)
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-lg font-bold">{t(L, "status")}</h1>
        <Card>
          <p className="text-sm">{t(L, "optedOutBanner")}</p>
          <Btn variant="outline" className="mt-3" onClick={() => actions.optIn(c.id)}>
            {t(L, "optBackIn")}
          </Btn>
        </Card>
      </div>
    );
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t(L, "statusDetails")}</h1>
        <TierBadge tier={c.tier} lang={L} size="lg" />
      </div>
      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t(L, "history")}</p>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">{t(L, "noNotifs")}</p>}
        {rows.map(({ o, pts }) => (
          <div key={o.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 border-b pb-1 text-xs last:border-0">
            <span>
              {o.id} · {fmtDate(o.createdAt, L)}
            </span>
            <span>
              {t(L, "freqPts")} {pts.freq}
            </span>
            <span>
              {t(L, "valuePts")} {pts.value}
            </span>
            <span className="font-bold text-primary">+{pts.total}</span>
          </div>
        ))}
      </Card>
      <Card className="space-y-1.5">
        <p className="text-sm font-semibold">{t(L, "howItWorks")}</p>
        {(["rule1", "rule2", "rule3", "rule4"] as const).map((k) => (
          <p key={k} className="text-sm text-muted-foreground">
            · {t(L, k)}
          </p>
        ))}
        <p className="pt-1 text-xs text-muted-foreground">
          {c.graceUntil != null ? t(L, "graceUntil", { date: fmtDate(c.graceUntil, L) }) : t(L, "graceNone")}
        </p>
      </Card>
      <button onClick={() => actions.optOut(c.id)} className="text-xs text-muted-foreground underline">
        {t(L, "optOut")} — {t(L, "optOutNote")}
      </button>
    </div>
  );
}
