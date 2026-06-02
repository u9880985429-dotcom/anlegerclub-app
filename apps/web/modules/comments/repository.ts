import { getSupabaseAdmin } from "@/lib/supabase";
import type { Comment } from "@traderiq/api";
import type { InsertCommentInput } from "./types";

/**
 * comments-REPOSITORY — der EINZIGE Ort mit Supabase-Zugriff fuer Kommentare.
 * Faellt auf []/null zurueck, wenn Supabase nicht konfiguriert ist (lokale
 * Entwicklung) — die UI bleibt funktionstuechtig, Comments verschwinden nur
 * bei jedem Reload.
 *
 * Andere Module/Seiten importieren NICHT diese Datei direkt, sondern die
 * oeffentliche Tuer `@/modules/comments` (index.ts).
 */

interface DbCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_is_team: boolean | null;
  author_team_badge: string | null;
  body_md: string;
  parent_id: string | null;
  visible: boolean | null;
  created_at: string;
}

function rowToComment(row: DbCommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorIsTeam: Boolean(row.author_is_team),
    authorTeamBadge: row.author_team_badge,
    bodyMd: row.body_md,
    parentId: row.parent_id,
    visible: row.visible !== false,
    createdAt: row.created_at,
  };
}

export async function listCommentsByPost(postId: string): Promise<Comment[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("visible", true)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[comments-repo] list failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToComment);
}

export async function insertComment(input: InsertCommentInput): Promise<Comment | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      author_name: input.authorName,
      author_is_team: input.authorIsTeam,
      author_team_badge: input.authorTeamBadge,
      body_md: input.bodyMd,
      parent_id: input.parentId ?? null,
    })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[comments-repo] insert failed:", error?.message);
    return null;
  }
  return rowToComment(data as DbCommentRow);
}
