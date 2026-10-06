import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Search } from "lucide-react";
import { DemoBar } from "@/components/demo/DemoBar";
import { Card, TierBadge } from "@/components/demo/ui";
import { useDemo, claimsThisMonth } from "@/lib/demo/store";
import * as R from "@/lib/demo/rules";
import { fmtAED, fmtDate, t } from "@/lib/demo/i18n";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Oasis Regulars — Support console demo" },
      {
        name: "description",
        content: "Support agent console demo: customer lookup, tier, credits, claims and reply macros for Oasis Regulars.",
      },
      { property: "og:title", content: "Oasis Regulars — Support console demo" },
      { property: "og:description", content: "Support console demo for the Oasis Regulars loyalty pilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Support,
});

const macroKeys = ["mTier", "mCredit", "mFriend"] as const;

function Support() {
  const s = useDemo();
  const L = s.lang;
  const now = Date.now();
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState(s.customers[0]!.id);
  const [copied, setCopied] = useState<string | null>(null);
  const matches = s.customers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.nameAr.includes(q) ||
      c.id.toLowerCase().includes(q.toLowerCase()),
  );
  const c = s.customers.find((x) => x.id === selId) ?? matches[0];
  const issued = c ? c.credits.reduce((sum, cr) => sum + cr.amount, 0) : 0;
  const redeemed = c ? c.credits.reduce((sum, cr) => sum + (cr.amount - cr.remaining), 0) : 0;

  const copy = (k: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(k);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 p-4">
        <h1 className="text-xl font-bold">{t(L, "navSupport")}</h1>
        <Card>
          <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(L, "search")}
              className="w-full bg-transparent text-sm outline-none"
              aria-label={t(L, "lookup")}
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {matches.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelId(m.id)}
                className={
                  m.id === c?.id
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                    : "rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted"
                }
              >
                {L === "ar" ? m.nameAr : m.name}
              </button>
            ))}
          </div>
        </Card>

        {c && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">{L === "ar" ? c.nameAr : c.name}</p>
                {c.group === "treatment" && !c.optedOut && <TierBadge tier={c.tier} lang={L} />}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t(L, "group")}</dt>
                <dd className="font-medium">
                  {c.group === "holdout" ? t(L, "holdout") : t(L, "treatment")}
                  {c.optedOut && ` · ${t(L, "optedOut")}`}
                </dd>
                <dt className="text-muted-foreground">{t(L, "points")}</dt>
                <dd className="font-medium">{R.points30(c.orders, now)}</dd>
                <dt className="text-muted-foreground">{t(L, "grace")}</dt>
                <dd className="font-medium">
                  {c.graceUntil != null ? t(L, "graceUntil", { date: fmtDate(c.graceUntil, L) }) : t(L, "graceNone")}
                </dd>
                <dt className="text-muted-foreground">{t(L, "issued")}</dt>
                <dd className="font-medium">{fmtAED(issued, L)}</dd>
                <dt className="text-muted-foreground">{t(L, "redeemed")}</dt>
                <dd className="font-medium">{fmtAED(redeemed, L)}</dd>
                <dt className="text-muted-foreground">{t(L, "claims")}</dt>
                <dd className="font-medium">{claimsThisMonth(c, now)}</dd>
              </dl>
            </Card>
            <Card className="space-y-2">
              <p className="text-sm font-semibold">{t(L, "macros")}</p>
              {macroKeys.map((k) => (
                <div key={k} className="flex items-center justify-between gap-2 rounded-xl border p-2.5">
                  <p className="text-sm">{t(L, k)}</p>
                  <button
                    onClick={() => copy(k, t(L, k))}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-medium hover:bg-accent"
                  >
                    <Copy className="size-3.5" aria-hidden />
                    {copied === k ? t(L, "copied") : t(L, "copy")}
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
