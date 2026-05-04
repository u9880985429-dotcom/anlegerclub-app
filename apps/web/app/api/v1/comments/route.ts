import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/access";
import { allUsers } from "@traderiq/api";
import { getPublicDisplayName, getTeamBadge, isTeamRole } from "@traderiq/api";
import { insertComment, listCommentsByPost } from "@/lib/comments-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { filterText } from "@traderiq/api";

export const dynamic = "force-dynamic";

const PostBody = z.object({
  postId: z.string().min(1),
  bodyMd: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
});

/**
 * GET /api/v1/comments?postId=...
 *
 * Liefert die Kommentare zu einem Post / Trade-Signal aus Supabase.
 * Faellt auf leere Liste zurueck, wenn Supabase noch nicht angebunden ist.
 */
export async function GET(req: Request) {
  await requireSession();
  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ ok: false, error: "missing_post_id" }, { status: 400 });
  }
  const comments = await listCommentsByPost(postId);
  return NextResponse.json({ ok: true, comments, supabaseConnected: isSupabaseConfigured() });
}

/**
 * POST /api/v1/comments
 *
 * Body: { postId, bodyMd, parentId? }
 * Schreibt einen neuen Kommentar in Supabase. Wendet vorher den Wordfilter
 * an: Werbung blockiert; Beleidigungen werden maskiert. Authorship kommt
 * aus der Server-Session — der Client kann die Identitaet nicht faelschen.
 */
export async function POST(req: Request) {
  const session = await requireSession();
  let body;
  try {
    body = PostBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "invalid_body" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  // Wordfilter: Werbung blockieren, Beleidigungen maskieren.
  const filtered = filterText(body.bodyMd);
  if (filtered.blocked) {
    return NextResponse.json(
      { ok: false, error: "blocked_by_filter", reason: "promo_or_external_link" },
      { status: 422 },
    );
  }

  const user = allUsers.find((u) => u.id === session.user.id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 401 });
  }

  const authorMeta = {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isTeamMember: user.isTeamMember,
  };

  const inserted = await insertComment({
    postId: body.postId,
    authorId: user.id,
    authorName: getPublicDisplayName(authorMeta),
    authorIsTeam: isTeamRole(user.role, user.isTeamMember),
    authorTeamBadge: getTeamBadge(authorMeta) ?? null,
    bodyMd: filtered.cleaned,
    parentId: body.parentId ?? null,
  });

  if (!inserted) {
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    comment: inserted,
    profanityMaskedCount: filtered.flaggedProfanity.length,
  });
}
