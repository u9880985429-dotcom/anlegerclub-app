import type { TradeSignal } from "@traderiq/api";
import { ACTION_BADGE_CLASS, ACTION_LABELS, formatGermanDate } from "@/lib/format";

interface TradeRowProps {
  trade: TradeSignal;
}

export function TradeRow({ trade }: TradeRowProps) {
  return (
    <article className="card-base p-5 transition hover:border-brand/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-muted-foreground">
            {formatGermanDate(trade.date)}
          </span>
          <span className={ACTION_BADGE_CLASS[trade.action] ?? "badge-base"}>
            {ACTION_LABELS[trade.action]}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {trade.tickers.map((t) => (
            <span key={t} className="badge-base font-mono">
              {t}
            </span>
          ))}
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug">{trade.title}</h3>
      <div className="mt-2 max-w-none text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {trade.bodyMd.split("\n\n").map((para, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderMd(para) }} />
        ))}
      </div>
    </article>
  );
}

// Tiny markdown stub: only **bold** for the demo. Phase 2: react-markdown.
function renderMd(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-muted px-1 py-0.5 text-xs font-mono\">$1</code>");
}
