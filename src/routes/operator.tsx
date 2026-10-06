import { createFileRoute } from "@tanstack/react-router";
import { DemoBar } from "@/components/demo/DemoBar";
import { Card, HealthPill, Toggle, type Health } from "@/components/demo/ui";
import { actions, useDemo, budgetLeft, type Settings } from "@/lib/demo/store";
import * as R from "@/lib/demo/rules";
import { fmtAED, fmtNum, t } from "@/lib/demo/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Oasis Regulars — Pilot operator demo" },
      {
        name: "description",
        content:
          "Pilot operator dashboard demo: treatment vs hold-out metrics, guardrails, budget and perk kill switches for Oasis Regulars.",
      },
      { property: "og:title", content: "Oasis Regulars — Pilot operator demo" },
      { property: "og:description", content: "Operator dashboard demo for the Oasis Regulars loyalty pilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Operator,
});

const perkKeys = [
  ["makeGood", "kMakeGood"],
  ["missingItem", "kMissing"],
  ["streak", "kStreak"],
  ["iftar", "kIftar"],
  ["goldBasket", "kGold"],
] as const;

function Operator() {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const treatment = s.customers.filter((c) => c.group === "treatment");
  const holdout = s.customers.filter((c) => c.group === "holdout");
  const avgOrders = (cs: typeof treatment) =>
    cs.length ? cs.reduce((sum, c) => sum + c.orders.length, 0) / cs.length : 0;
  const bigShare = (cs: typeof treatment) => {
    const orders = cs.flatMap((c) => c.orders);
    return orders.length ? orders.filter((o) => o.subtotal >= R.GOLD_PERK_MIN_BASKET).length / orders.length : 0;
  };
  const silverShare = treatment.length
    ? treatment.filter((c) => R.TIER_RANK[c.tier] >= R.TIER_RANK.silver).length / treatment.length
    : 0;
  const lateOrders = s.customers.flatMap((c) => c.orders).filter((o) => o.actualMin != null && R.isLate(o.etaMin, o.actualMin));
  const autoCredited = lateOrders.filter((o) => o.makeGoodCreditId).length;
  const budgetPct = s.settings.budgetSpent / s.settings.budgetCap;
  const budgetHealth: Health = budgetPct >= 1 ? "breach" : budgetPct >= 0.8 ? "watch" : "ok";

  const metrics = [
    { label: t(L, "repeat"), t: avgOrders(treatment), h: avgOrders(holdout), fmt: (n: number) => n.toFixed(1) },
    {
      label: t(L, "big"),
      t: bigShare(treatment),
      h: bigShare(holdout),
      fmt: (n: number) => `${Math.round(n * 100)}%`,
    },
  ];

  const num = (v: string, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBar />
      <main className="mx-auto w-full max-w-6xl space-y-5 p-4">
        <div>
          <h1 className="text-xl font-bold">{t(L, "dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{t(L, "zone")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((m) => (
            <Card key={m.label}>
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold text-primary">{m.fmt(m.t)}</p>
                  <p className="text-xs text-muted-foreground">{t(L, "treatment")}</p>
                </div>
                <div className="text-end">
                  <p className="text-2xl font-bold text-muted-foreground">{m.fmt(m.h)}</p>
                  <p className="text-xs text-muted-foreground">{t(L, "holdout")}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-warning">
                {t(L, "directional")} · {t(L, "ci")}: ±{m.fmt(Math.abs(m.t - m.h) * 0.4 || 0.1)}
              </p>
            </Card>
          ))}
          <Card>
            <p className="text-sm text-muted-foreground">{t(L, "reachSilver")}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{Math.round(silverShare * 100)}%</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t(L, "autoCredited")}: {autoCredited}/{lateOrders.length}
            </p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{t(L, "budget")}</p>
            <HealthPill h={budgetHealth} lang={L} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(L, "budgetOf", { spent: fmtNum(s.settings.budgetSpent, L), cap: fmtNum(s.settings.budgetCap, L) })}
          </p>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", budgetHealth === "ok" ? "bg-success" : budgetHealth === "watch" ? "bg-warning" : "bg-destructive")}
              style={{ width: `${Math.min(100, budgetPct * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(L, "value")}: {fmtAED(budgetLeft(s), L)}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <p className="text-sm font-semibold">{t(L, "killSwitches")}</p>
            {perkKeys.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span>{t(L, label)}</span>
                <Toggle label={t(L, label)} checked={s.settings.perks[key]} onChange={(v) => actions.perk(key, v)} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">{t(L, "liveNote")}</p>
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold">{t(L, "caps")}</p>
            {(
              [
                ["makeGoodCap", "capMakeGood"],
                ["goldPerkCap", "capGold"],
                ["claimsBeforeReview", "capClaims"],
                ["budgetCap", "capBudget"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-3 text-sm">
                <span>{t(L, label)}</span>
                <input
                  type="number"
                  min={0}
                  value={s.settings[key]}
                  onChange={(e) => actions.settings({ [key]: num(e.target.value, s.settings[key]) } as Partial<Settings>)}
                  className="w-24 rounded-lg border bg-background px-2 py-1 text-end"
                />
              </label>
            ))}
          </Card>

          <Card className="space-y-3 md:col-span-2">
            <p className="text-sm font-semibold">{t(L, "programme")}</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <span className="flex items-center gap-2">
                {t(L, "stage")}
                {([1, 2] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => actions.settings({ stage: n })}
                    aria-pressed={s.settings.stage === n}
                    className={
                      s.settings.stage === n
                        ? "rounded-md bg-primary px-2.5 py-1 font-semibold text-primary-foreground"
                        : "rounded-md border px-2.5 py-1"
                    }
                  >
                    {n}
                  </button>
                ))}
              </span>
              <label className="flex items-center gap-2">
                {t(L, "split")}
                <select
                  value={s.settings.holdoutSplit}
                  onChange={(e) => actions.settings({ holdoutSplit: e.target.value as Settings["holdoutSplit"] })}
                  className="rounded-lg border bg-background px-2 py-1"
                >
                  {(["85/15", "70/30", "50/50"] as const).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">{t(L, "stageHelp")}</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
