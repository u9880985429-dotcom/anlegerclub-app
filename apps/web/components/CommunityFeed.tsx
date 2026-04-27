import Link from "next/link";
import { ExternalLink, Pin, MessageSquare, EyeOff } from "lucide-react";
import { getCommunityBySlug, getPostsByCommunity } from "@traderiq/api";
import type { ProductSlug } from "@traderiq/api";
import { CommunityComposer } from "./CommunityComposer";
import { LikeButton } from "./LikeButton";
import { formatRelative } from "@/lib/format";

interface CommunityFeedProps {
  slug: Exclude<ProductSlug, "all-access">;
}

export function CommunityFeed({ slug }: CommunityFeedProps) {
  const community = getCommunityBySlug(slug)!;
  const posts = getPostsByCommunity(community.id);

  return (
    <div className="space-y-4">
      <div className="card-base p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand">Freier Community-Bereich</div>
            <h3 className="mt-1 font-semibold">{community.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Hier kannst du frei mit anderen Mitgliedern und der Redaktion austauschen – unabhängig von einzelnen Trades.
              Diskussionen direkt am Trade findest du auf der jeweiligen Trade-Detailseite.
            </p>
          </div>
          <a href={community.archiveUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
            Produktarchiv öffnen <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <CommunityComposer placeholder="Was möchtest du mit der Community teilen?" />

      <div className="space-y-3">
        {posts.map((p) => (
          <article key={p.id} className={`card-base p-5 transition hover:border-brand/40 ${!p.visible ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${p.authorIsTeam ? "bg-brand text-white" : "bg-muted"}`}>
                  {p.authorName.split(" ").map((n) => n.charAt(0)).slice(0, 2).join("")}
                </div>
                <span className="font-medium text-foreground">{p.authorName}</span>
                {p.authorIsTeam && p.authorTeamBadge && (
                  <span className="inline-flex items-center rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                    {p.authorTeamBadge}
                  </span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{formatRelative(p.createdAt)}</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {p.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
                    <Pin className="h-3 w-3" /> angepinnt
                  </span>
                )}
                {!p.visible && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                    <EyeOff className="h-3 w-3" /> versteckt
                  </span>
                )}
              </div>
            </div>

            {p.title && (
              <Link href={`/community/${slug}/post/${p.id}` as never} className="text-base font-semibold hover:text-brand">
                {p.title}
              </Link>
            )}
            <Link href={`/community/${slug}/post/${p.id}` as never} className="block">
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.bodyMd}</p>
            </Link>

            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <LikeButton initialCount={p.reactions[0]?.count ?? 0} />
              <Link href={`/community/${slug}/post/${p.id}` as never} className="ml-auto inline-flex items-center gap-1 hover:text-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                {p.commentCount} Antworten
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
