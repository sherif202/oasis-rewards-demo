import { Link } from "@tanstack/react-router";
import { FlaskConical, Moon, RefreshCw, RotateCcw, Languages } from "lucide-react";
import { useState } from "react";
import { actions, useDemo } from "@/lib/demo/store";
import { t } from "@/lib/demo/i18n";
import { Toggle } from "./ui";

const personaKey = { gold: "personaGold", silver: "personaSilver", light: "personaLight", holdout: "personaHoldout" } as const;

export function DemoBar() {
  const s = useDemo();
  const L = s.lang;
  const [flash, setFlash] = useState<string | null>(null);
  const say = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(null), 2200);
  };
  return (
    <header className="sticky top-0 z-40">
      <div className="demo-stripes border-b border-demo-foreground/20 text-demo-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-demo-foreground px-3 py-1 text-xs font-bold text-demo">
            <FlaskConical className="size-3.5" aria-hidden /> {t(L, "demoLabel")}
          </span>
          <label className="inline-flex items-center gap-2 font-medium">
            {t(L, "persona")}
            <select
              value={s.currentId}
              onChange={(e) => actions.setCurrent(e.target.value)}
              className="rounded-lg border border-demo-foreground/30 bg-card px-2 py-1 text-foreground"
            >
              {s.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {L === "ar" ? c.nameAr : c.name} — {t(L, personaKey[c.persona as keyof typeof personaKey])}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              actions.runNightly();
              say(t(L, "nightlyDone"));
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 font-medium text-foreground hover:bg-muted"
          >
            <RefreshCw className="size-3.5" aria-hidden /> {t(L, "runNightly")}
          </button>
          <span className="inline-flex items-center gap-2 font-medium">
            <Moon className="size-4" aria-hidden /> {t(L, "ramadan")}
            <Toggle label={t(L, "ramadan")} checked={s.settings.ramadan} onChange={(v) => actions.settings({ ramadan: v })} />
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            {t(L, "stage")}
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                onClick={() => actions.settings({ stage: n })}
                aria-pressed={s.settings.stage === n}
                className={
                  s.settings.stage === n
                    ? "rounded-md bg-demo-foreground px-2 py-0.5 text-demo"
                    : "rounded-md bg-card px-2 py-0.5 text-foreground"
                }
              >
                {n}
              </button>
            ))}
          </span>
          <button
            onClick={() => {
              actions.reset();
              say(t(L, "resetDone"));
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 font-medium text-foreground hover:bg-muted"
          >
            <RotateCcw className="size-3.5" aria-hidden /> {t(L, "reset")}
          </button>
          {flash && <span role="status" className="font-semibold">✓ {flash}</span>}
        </div>
      </div>
      <nav className="border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2">
          <span className="me-4 font-semibold text-primary">{t(L, "brand")}</span>
          {(
            [
              ["/", "navCustomer"],
              ["/support", "navSupport"],
              ["/operator", "navOperator"],
            ] as const
          ).map(([to, k]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              {t(L, k)}
            </Link>
          ))}
          <button
            onClick={() => actions.setLang(L === "en" ? "ar" : "en")}
            className="ms-auto inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <Languages className="size-4" aria-hidden /> {L === "en" ? "العربية" : "English"}
          </button>
        </div>
      </nav>
    </header>
  );
}
