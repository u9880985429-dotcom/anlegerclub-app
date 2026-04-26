import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pin, MessageSquare, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireProductAccess } from "@/lib/access";
import { getCommunityBySlug, getPostsByCommunity, type ProductSlug } from "@traderiq/api";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

const VALID_SLUGS: ProductSlug[] = ["starter", "trend", "stillhalter", "cockpit"];

export default async function CommunityPage({ params }: { params: { slug: string } }) {
  if (!VALID_SLUGS.includes(params.slug as ProductSlug)) notFound();
  const slug = params.slug as Exclude<ProductSlug, "all-access">;
  const session = await requireProductAccess(slug);
  const community = getCommunityBySlug(slug)!;
  const isStaff = session.user.role === "STAFF" || session.user.role === "OWNER" || session.user.role === "ADMIN" || session.user.role === "MODERATOR";
  const posts = getPostsByCommunity(community.id, { includeHidden: isStaff });

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title={community.name}
        description={`${posts.length} Beiträge · ${posts.filter((p) => p.pinned).length} angepinnt`}
        action={
          <a
            href={community.archiveUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Produktarchiv öffnen <ExternalLink className="h-3.5 w-3.5" />
          </a>
        }
      />

      {/* New post stub */}
      <div className="card-base mb-6 p-4">
        <textarea
          className="input-base h-20 resize-none"
          placeholder="Was möchtest du mit der Community teilen? (Bilder, PDF, Excel als Anhang ab Phase 2)"
          disabled
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">@-Erwähnungen, #Hashtags & Anhänge: Phase 2</span>
          <button className="btn-brand opacity-50" disabled>Beitrag posten</button>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <article
            key={p.id}
            className={`card-base p-5 transition hover:border-brand/40 ${
              !p.visible ? "border-amber-500/40 bg-amber-500/5" : ""
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {p.authorName.split(" ").map((n) => n.charAt(0)).slice(0, 2).join("")}
                </div>
                <span className="font-medium text-foreground">{p.authorName}</span>
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
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
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
              {p.reactions.map((r) => (
                <span key={r.emoji} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5">
                  <span>{r.emoji}</span>
                  <span className="font-mono">{r.count}</span>
                </span>
              ))}
              <Link href={`/community/${slug}/post/${p.id}` as never} className="ml-auto inline-flex items-center gap-1 hover:text-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                {p.commentCount} Antworten
              </Link>
              {isStaff && (
                <button className="text-amber-400 hover:underline" title="Sichtbarkeit umschalten (Demo)">
                  {p.visible ? "Verstecken" : "Einblenden"}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
