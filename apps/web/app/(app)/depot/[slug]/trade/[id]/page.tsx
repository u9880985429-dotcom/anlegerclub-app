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
import { ACTION_BADGE_CLASS, ACTION_LABELS, formatGermanDate } from "@/lib/format";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { CommunityComposer } from "@/components/CommunityComposer";
import { LikeButton } from "@/components/LikeButton";
import { CommentThread } from "@/components/CommentThread";
import { TradeAdminToolbar } from "./TradeAdminToolbar";

export const dynamic = "force-dynamic";

const VALID: ProductSlug[] = ["starter", "trend", "stillhalter", "cockpit"];

export default async function TradeDetailPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  if (!VALID.includes(params.slug as ProductSlug)) notFound();
  const session = await requireProductAccess(params.slug as Exclude<ProductSlug, "all-access">);
  const trade = getTradeById(params.id);
  if (!trade) notFound();
  const comments = getCommentsByTrade(trade.id);
  const reactions = getReactionsByTrade(trade.id);

  const isStaff = session.user.role === "STAFF" || session.user.role === "OWNER" || session.user.role === "ADMIN" || session.user.role === "MODERATOR";

  return (
    <>
      <Link
        href={`/depot/${params.slug}` as never}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zum Depot
      </Link>

      {isStaff && <TradeAdminToolbar tradeId={trade.id} initialVisible={true} initialTitle={trade.title} initialBody={trade.bodyMd} />}

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

        <div className="mt-6">
          <VideoPlaceholder title={`Erklärvideo zu ${trade.tickers.join(", ")}`} duration="3:42" seed={trade.id} />
          <p className="mt-2 text-xs text-muted-foreground">Inhalte sind nicht herunterladbar – Wasserzeichen + DRM ab Phase 3 (Mux).</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {reactions.map((r) => (
            <span key={r.emoji} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
              <span>{r.emoji}</span>
              <span className="font-mono">{r.count}</span>
            </span>
          ))}
          <LikeButton initialCount={reactions[0]?.count ?? 0} />
        </div>
      </article>

      <h2 className="mb-3 mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="h-4 w-4" /> Diskussion ({comments.length})
      </h2>

      <div className="mb-4">
        <CommunityComposer
          placeholder="Frage stellen oder Erfahrung teilen…"
          contextHint="Fragen zum Signal? Schreib's – die Redaktion und andere Mitglieder helfen. Du kannst auch direkt auf einzelne Antworten reagieren."
        />
      </div>

      <CommentThread
        comments={comments}
        currentUser={{ name: `${session.user.firstName} ${session.user.lastName}`, role: session.user.role }}
      />
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
