import { ArrowRight } from "lucide-react";
import { getPitchForAudience } from "@traderiq/api";

interface PitchCardProps {
  audienceProductSlug: "starter";
}

/**
 * Spec §14 — Pitch shown at end of trade list, only when user-product = "starter".
 */
export function PitchCard({ audienceProductSlug }: PitchCardProps) {
  const pitch = getPitchForAudience(audienceProductSlug);
  if (!pitch) return null;
  return (
    <div className="relative overflow-hidden rounded-xl border border-brand/40 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-6 shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/20 blur-2xl" />
      <div className="relative">
        <div className="mb-2 inline-block rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
          Empfohlen für dich
        </div>
        <h3 className="mt-2 text-xl font-bold leading-snug">{pitch.headline}</h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{pitch.bodyMd}</p>
        <a
          href={pitch.ctaUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-brand mt-4 inline-flex items-center gap-2"
        >
          {pitch.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
