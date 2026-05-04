import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { requireProductAccess } from "@/lib/access";
import { getCommentsByPost, getPostById, type ProductSlug } from "@traderiq/api";
import { listCommentsByPost } from "@/lib/comments-store";
import { CommunityComposer } from "@/components/CommunityComposer";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

const VALID_SLUGS: ProductSlug[] = ["starter", "trend", "stillhalter", "cockpit"];

export default async function PostDetailPage({ params }: { params: { slug: string; id: string } }) {
  if (!VALID_SLUGS.includes(params.slug as ProductSlug)) notFound();
  const session = await requireProductAccess(params.slug as Exclude<ProductSlug, "all-access">);
  const post = getPostById(params.id);
  if (!post) notFound();
  const [dbComments, mockComments] = await Promise.all([
    listCommentsByPost(post.id),
    Promise.resolve(getCommentsByPost(post.id)),
  ]);
  const comments = [...mockComments, ...dbComments];

  return (
    <>
      <Link
        href={`/community/${params.slug}` as never}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zur Community
      </Link>

      <article className="card-base p-6">
        <div className="mb-3 flex items-center gap-2 text-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
            {post.authorName.split(" ").map((n) => n.charAt(0)).slice(0, 2).join("")}
          </div>
          <span className="font-medium">{post.authorName}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formatRelative(post.createdAt)}</span>
        </div>
        {post.title && <h1 className="text-xl font-bold">{post.title}</h1>}
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{post.bodyMd}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {post.reactions.map((r) => (
            <button key={r.emoji} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs hover:border-brand">
              <span>{r.emoji}</span>
              <span className="font-mono">{r.count}</span>
            </button>
          ))}
          <button className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:text-brand" title="Weitere Reaktion (Phase 2)">+ Reagieren</button>
        </div>
      </article>

      <h2 className="mb-3 mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="h-4 w-4" /> Antworten ({comments.length})
      </h2>
      <div className="space-y-3">
        {comments.map((c) => (
          <article key={c.id} className="card-base p-4">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="font-medium">{c.authorName}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{formatRelative(c.createdAt)}</span>
            </div>
            <p className="text-sm">{c.bodyMd}</p>
          </article>
        ))}

        <CommunityComposer
          postId={post.id}
          placeholder="Antwort schreiben…"
          userRole={session.user.role}
        />
      </div>
    </>
  );
}
