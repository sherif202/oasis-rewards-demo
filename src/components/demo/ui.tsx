import { Crown, Medal, UserRound, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/demo/i18n";
import type { Lang } from "@/lib/demo/store";
import type { TierId } from "@/lib/demo/rules";

const tierStyle: Record<TierId, string> = {
  member: "bg-secondary text-secondary-foreground",
  silver: "bg-silver-soft text-silver",
  gold: "bg-gold-soft text-gold",
};
export const TierIcon = ({ tier, className }: { tier: TierId; className?: string }) => {
  const I = tier === "gold" ? Crown : tier === "silver" ? Medal : UserRound;
  return <I className={className} aria-hidden />;
};
export function TierBadge({ tier, lang, size = "sm" }: { tier: TierId; lang: Lang; size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        tierStyle[tier],
        size === "lg" ? "px-3 py-1.5 text-base" : "px-2.5 py-0.5 text-xs",
      )}
    >
      <TierIcon tier={tier} className={size === "lg" ? "size-5" : "size-3.5"} />
      {t(lang, tier)}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-4 shadow-soft", className)}>{children}</div>;
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "soft";
  className?: string;
  disabled?: boolean;
}) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border bg-card text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    soft: "bg-accent text-accent-foreground hover:bg-accent/80",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
        v,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-input",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-card shadow transition-transform",
          checked ? "translate-x-5.5 rtl:-translate-x-5.5" : "translate-x-0.5 rtl:-translate-x-0.5",
        )}
      />
    </button>
  );
}

export type Health = "ok" | "watch" | "breach";
export function HealthPill({ h, lang }: { h: Health; lang: Lang }) {
  const I = h === "ok" ? CheckCircle2 : h === "watch" ? AlertTriangle : XCircle;
  const cls = { ok: "bg-success-soft text-success", watch: "bg-warning-soft text-warning", breach: "bg-danger-soft text-destructive" }[h];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", cls)}>
      <I className="size-3.5" aria-hidden />
      {t(lang, h)}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(value * 100)}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  );
}
