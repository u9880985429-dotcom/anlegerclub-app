import { PageHeader } from "@/components/PageHeader";
import { allComments, allPosts, communities, reports } from "@traderiq/api";
import { CheckCircle2, EyeOff, MessageSquare, AlertTriangle, Clock } from "lucide-react";
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

      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-400">
        <AlertTriangle className="h-4 w-4" />
        Mod-Queue ({open.length} offen)
      </h2>
      <div className="card-base mb-8 divide-y divide-border">
        {open.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine offenen Reports. ✨</div>}
        {open.map((r) => {
          const community = communities.find((c) =>
            allPosts.some((p) => p.id === r.postId && p.communityId === c.id),
          );
          const post = r.postId ? allPosts.find((p) => p.id === r.postId) : null;
          const comment = r.commentId ? allComments.find((c) => c.id === r.commentId) : null;
          const targetText = post?.title ?? post?.bodyMd ?? comment?.bodyMd ?? "—";
          return (
            <div key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="badge-loss">REPORT</span>
                    <span className="text-muted-foreground">von <strong className="text-foreground">{r.reporterName}</strong></span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelative(r.createdAt)}</span>
                    {community && <span className="badge-base">{community.name}</span>}
                  </div>
                  <p className="text-sm font-medium">Grund: {r.reason}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {post ? "Post: " : "Kommentar: "}„{targetText}"
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button className="btn-secondary inline-flex items-center gap-1" title="Inhalt verstecken">
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
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{posts.length} Posts · {posts.filter((p) => p.pinned).length} angepinnt · {posts.filter((p) => !p.visible).length} versteckt</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary">Wortfilter</button>
                <button className="btn-secondary">Audit-Log</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Phase 2: Mute (1h/24h/7d/perm) · Bulk-Aktionen · Wortfilter pro Community · vollständiger Audit-Trail.
      </div>
    </>
  );
}
