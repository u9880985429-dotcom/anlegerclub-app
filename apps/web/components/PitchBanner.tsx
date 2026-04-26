import { ArrowRight, Sparkles, Calendar, BookOpen } from "lucide-react";
import { STRATEGY_CALL, WEBINAR_STILLHALTER } from "@traderiq/api";

interface PitchBannerProps {
  variant: "webinar" | "strategy" | "both";
  className?: string;
}

export function PitchBanner({ variant, className }: PitchBannerProps) {
  if (variant === "webinar") return <WebinarCard className={className} />;
  if (variant === "strategy") return <StrategyCard className={className} />;
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className ?? ""}`}>
      <WebinarCard />
      <StrategyCard />
    </div>
  );
}

function WebinarCard({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-brand/40 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-5 shadow-sm ${className ?? ""}`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/20 blur-2xl" />
      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-brand/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
          <BookOpen className="h-3 w-3" /> 5-Tage-Webinar · kostenlos
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug">Geheimnisse der Stillhalter</h3>
        <p className="mt-2 text-sm text-muted-foreground">{WEBINAR_STILLHALTER.pitch}</p>
        <a
          href={WEBINAR_STILLHALTER.url}
          target="_blank"
          rel="noreferrer"
          className="btn-brand mt-4 inline-flex items-center gap-2"
        >
          {WEBINAR_STILLHALTER.label}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function StrategyCard({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 shadow-sm ${className ?? ""}`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          <Calendar className="h-3 w-3" /> Kostenfrei · 1:1
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug">Persönliches Strategiegespräch</h3>
        <p className="mt-2 text-sm text-muted-foreground">{STRATEGY_CALL.pitch}</p>
        <a
          href={STRATEGY_CALL.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {STRATEGY_CALL.label}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
