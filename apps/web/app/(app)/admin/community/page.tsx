import Link from "next/link";
import { CheckCircle2, EyeOff, MessageSquare, AlertTriangle, Clock, Eye, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { allComments, allPosts, communities, reports } from "@traderiq/api";
import { formatRelative } from "@/lib/format";

export default function AdminCommunityPage() {
  const open = reports.filter((r) => r.status === "OPEN");
  const resolved = reports.filter((r) => r.status === "RESOLVED");
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Community-Moderation"
        description={`${open.length} offene Reports · ${resolved.length} bearbeitet · ${allPosts.length} Posts gesamt`}
      />

      <div className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-xs text-amber-700">
        ⚙️ <strong>Auto-Workflow:</strong> Sobald ein User einen Beitrag meldet, wird er <strong>automatisch versteckt</strong> und der ursprüngliche Autor erhält die Nachricht{" "}
        <em className="text-foreground">„Kommentar wird geprüft. Das kann bis zu 48 h dauern."</em>{" "}
        Erst nach Prüfung durch dich entscheidest du: zurück freigeben oder dauerhaft entfernen.
      </div>

      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-700">
        <AlertTriangle className="h-4 w-4" />
        Mod-Queue ({open.length} offen)
      </h2>
      <div className="card-base mb-8 divide-y divide-border">
        {open.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine offenen Reports. ✨</div>}
        {open.map((r) => {
          const post = r.postId ? allPosts.find((p) => p.id === r.postId) : null;
          const comment = r.commentId ? allComments.find((c) => c.id === r.commentId) : null;
          const community = post
            ? communities.find((c) => c.id === post.communityId)
            : null;
          const targetText = post?.title ?? post?.bodyMd ?? comment?.bodyMd ?? "—";
          const targetHref = post && community
            ? `/community/${community.productSlug}/post/${post.id}`
            : "/admin/community";

          return (
            <div key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link href={targetHref as never} className="flex-1 min-w-0 group">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="badge-loss">REPORT</span>
                    <span className="text-muted-foreground">von <strong className="text-foreground">{r.reporterName}</strong></span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelative(r.createdAt)}</span>
                    {community && <span className="badge-base">{community.name}</span>}
                    <span className="badge-base">⚠️ Auto-versteckt</span>
                  </div>
                  <p className="text-sm font-medium group-hover:text-brand">Grund: {r.reason}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {post ? "Post: " : "Kommentar: "}„{targetText}"
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                    Beitrag im Original ansehen <ExternalLink className="h-3 w-3" />
                  </span>
                </Link>
                <div className="flex flex-shrink-0 gap-2">
                  <button className="btn-secondary inline-flex items-center gap-1" title="Wieder einblenden">
                    <Eye className="h-3.5 w-3.5" /> Freigeben
                  </button>
                  <button className="btn-secondary inline-flex items-center gap-1 text-amber-700" title="Dauerhaft verstecken">
                    <EyeOff className="h-3.5 w-3.5" /> Verstecken
                  </button>
                  <button className="btn-brand inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="h-4 w-4" /> Channels
      </h2>
      <div className="card-base divide-y divide-border">
        {communities.map((c) => {
          const posts = allPosts.filter((p) => p.communityId === c.id);
          return (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {posts.length} Posts · {posts.filter((p) => p.pinned).length} angepinnt · {posts.filter((p) => !p.visible).length} versteckt
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/community/${c.productSlug}` as never} className="btn-secondary inline-flex items-center gap-1">
                  Öffnen <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Phase 2: Mute (1 h / 24 h / 7 d / perm) · Bulk-Aktionen · KI-basierte Werbe-/Beleidigungs-Erkennung · Wortfilter pro Community konfigurierbar.
      </div>
    </>
  );
}
