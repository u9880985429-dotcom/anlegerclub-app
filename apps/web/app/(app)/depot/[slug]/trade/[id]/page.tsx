import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { requireProductAccess } from "@/lib/access";
import {
  getCommentsByTrade,
  getReactionsByTrade,
  getTradeById,
  type ProductSlug,
} from "@traderiq/api";
import { ACTION_BADGE_CLASS, ACTION_LABELS, formatGermanDate, formatRelative } from "@/lib/format";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { CommunityComposer } from "@/components/CommunityComposer";
import { LikeButton } from "@/components/LikeButton";

export const dynamic = "force-dynamic";

const VALID: ProductSlug[] = ["starter", "trend", "stillhalter", "cockpit"];

export default async function TradeDetailPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  if (!VALID.includes(params.slug as ProductSlug)) notFound();
  await requireProductAccess(params.slug as Exclude<ProductSlug, "all-access">);
  const trade = getTradeById(params.id);
  if (!trade) notFound();
  const comments = getCommentsByTrade(trade.id);
  const reactions = getReactionsByTrade(trade.id);

  return (
    <>
      <Link
        href={`/depot/${params.slug}` as never}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zum Depot
      </Link>

      {/* Trade-Header */}
      <article className="card-base p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">{formatGermanDate(trade.date)}</span>
            <span className={ACTION_BADGE_CLASS[trade.action] ?? "badge-base"}>
              {ACTION_LABELS[trade.action]}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {trade.tickers.map((t) => (
              <span key={t} className="badge-base font-mono">{t}</span>
            ))}
          </div>
        </div>

        <h1 className="mt-3 text-xl font-bold leading-snug md:text-2xl">{trade.title}</h1>

        <div className="prose-tiq mt-3 max-w-none whitespace-pre-line text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
          {trade.bodyMd.split("\n\n").map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: renderMd(para) }} />
          ))}
        </div>

        {/* Optionales Video zum Trade */}
        <div className="mt-6">
          <VideoPlaceholder
            title={`Erklärvideo zu ${trade.tickers.join(", ")}`}
            duration="3:42"
            seed={trade.id}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Inhalte sind nicht herunterladbar – Wasserzeichen + DRM ab Phase 3 (Mux).
          </p>
        </div>

        {/* Reaktionen */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {reactions.map((r) => (
            <LikeButtonCompat key={r.emoji} emoji={r.emoji} count={r.count} />
          ))}
          <LikeButton initialCount={reactions[0]?.count ?? 0} />
        </div>
      </article>

      {/* Diskussion */}
      <h2 className="mb-3 mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="h-4 w-4" /> Diskussion ({comments.length})
      </h2>

      <div className="mb-4">
        <CommunityComposer
          placeholder="Frage stellen oder Erfahrung teilen…"
          contextHint="Fragen zum Signal? Schreib's – die Redaktion und andere Mitglieder helfen."
        />
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <article key={c.id} className="card-base p-4">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {c.authorName.split(" ").map((n) => n.charAt(0)).slice(0, 2).join("")}
              </div>
              <span className="font-medium">{c.authorName}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{formatRelative(c.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed">{c.bodyMd}</p>
            <div className="mt-2">
              <LikeButton initialCount={Math.floor(Math.random() * 6)} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function renderMd(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">$1</code>');
}

// Kompakte read-only-Anzeige für Mock-Reactions die schon existieren.
function LikeButtonCompat({ emoji, count }: { emoji: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
      <span>{emoji}</span>
      <span className="font-mono">{count}</span>
    </span>
  );
}
