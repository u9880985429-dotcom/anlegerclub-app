import type { Comment, Community, Post, ProductSlug, Report } from "../types";
import { getPublicDisplayName, getTeamBadge, isTeamRole } from "./displayName";

/**
 * Author-Roll-Map: bestimmt wie der Name dieses Autors öffentlich dargestellt wird.
 * Quelle der Wahrheit für Autor-Rolle + Team-Status. Synchron zu users.ts.
 *
 * Iteration 40: Alle Test-Mitglieder entfernt — nur noch Owner (Andrei) + Admin
 * (Max) als Author-IDs. Alle alten Demo-Posts/Comments/Reports geleert.
 */
const AUTHOR_META: Record<string, { firstName: string; lastName: string; role: import("../types").Role; isTeamMember?: boolean }> = {
  u_andrei: { firstName: "Andrei", lastName: "Trader IQ", role: "OWNER", isTeamMember: true },
  u_max: { firstName: "Max", lastName: "Bauer", role: "ADMIN", isTeamMember: true },
};

function publicNameFor(authorId: string, fallbackFirst: string, fallbackLast: string): string {
  const meta = AUTHOR_META[authorId] ?? { firstName: fallbackFirst, lastName: fallbackLast, role: "MEMBER" as const };
  return getPublicDisplayName(meta);
}

function authorMetaFor(authorId: string) {
  const m = AUTHOR_META[authorId];
  if (!m) return { isTeam: false, badge: null };
  return {
    isTeam: isTeamRole(m.role, m.isTeamMember),
    badge: getTeamBadge(m),
  };
}

export const communities: Community[] = [
  { id: "c_starter", productSlug: "starter", name: "Starter Depot Community", archiveUrl: "https://member.geldiq.com/s/geldiq/starter-depot-8740b018" },
  { id: "c_trend", productSlug: "trend", name: "Trend Depot Community", archiveUrl: "https://member.geldiq.com/s/geldiq/trend-depot-c8b71c4e" },
  { id: "c_stillhalter", productSlug: "stillhalter", name: "Stillhalter Depot Community", archiveUrl: "https://member.geldiq.com/s/geldiq/stillhalter-depot" },
  { id: "c_cockpit", productSlug: "cockpit", name: "Trader Cockpit Community", archiveUrl: "https://member.geldiq.com/s/geldiq/trader-cockpit" },
];

const PIN_TITLES = [
  "📌 Willkommen in der Community – bitte Hausregeln lesen",
  "📌 Wichtig: So funktionieren Erwähnungen & Tags",
];

function buildPostsFor(community: Community): Post[] {
  const now = Date.now();
  const adminMeta = authorMetaFor("u_max");
  const pinned: Post[] = PIN_TITLES.map((title, i) => ({
    id: `p_${community.id}_pin_${i}`,
    communityId: community.id,
    authorId: "u_max",
    authorName: publicNameFor("u_max", "Max", "Bauer"),
    authorIsTeam: adminMeta.isTeam,
    authorTeamBadge: adminMeta.badge,
    title,
    bodyMd: i === 0
      ? "Hier herrscht ein freundlicher, respektvoller Ton. Keine Anlageberatung, keine Empfehlungen für Drittprodukte, keine Werbung. Bei Fragen meldet euch bei einem Mod."
      : "Erwähne andere Mitglieder mit `@vorname.nachname`. Nutze Hashtags wie `#trade-idee`, `#frage`, `#feedback` für bessere Auffindbarkeit.",
    pinned: true,
    visible: true,
    hiddenById: null,
    reactions: [],
    commentCount: 0,
    createdAt: new Date(now - (30 + i) * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Iter 40: alle Member-Demo-Posts entfernt — nur noch die 2 Pinned-Welcome-Posts
  // bleiben fuer den Phase-1-Look-and-Feel. Echte Posts kommen in Phase 2 ueber
  // den User-Ingest-Pfad rein.
  return pinned;
}

export const allPosts: Post[] = communities.flatMap(buildPostsFor);

export function getPostsByCommunity(communityId: string, opts?: { includeHidden?: boolean }): Post[] {
  return allPosts
    .filter((p) => p.communityId === communityId && (opts?.includeHidden || p.visible))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
}

export function getCommunityBySlug(slug: ProductSlug): Community | undefined {
  return communities.find((c) => c.productSlug === slug);
}

export function getCommunityById(id: string): Community | undefined {
  return communities.find((c) => c.id === id);
}

export function getPostById(id: string): Post | undefined {
  return allPosts.find((p) => p.id === id);
}

// ─── Comments ─────────────────────────────────────────────────────────────
// Iter 40: Alle Demo-Comments entfernt. moderationFlaggedComments bleiben als
// anonyme Mock-Beispiele fuer den Wordfilter-Demo-Pfad.

export const moderationFlaggedComments = [
  {
    id: "mod_flag_1",
    authorName: "Anonym A.",
    raw: "Wer das immer noch nicht checkt, ist echt ein Vollidiot.",
    masked: "Wer das immer noch nicht checkt, ist echt ein V*********t.",
    reason: 'Beleidigung („Vollidiot")',
  },
  {
    id: "mod_flag_2",
    authorName: "Anonym B.",
    raw: "Hört auf mit dem Schwachsinn, du Hurensohn.",
    masked: "Hört auf mit dem Schwachsinn, du H*********n.",
    reason: 'Schwere Beleidigung („Hurensohn")',
  },
  {
    id: "mod_flag_3",
    authorName: "Anonym C.",
    raw: "Das ist doch komplett behindert was du schreibst.",
    masked: "Das ist doch komplett b********t was du schreibst.",
    reason: 'Diskriminierende Wortwahl („behindert" als Schimpfwort)',
  },
];

export const allComments: Comment[] = [];

export function getCommentsByPost(postId: string): Comment[] {
  return allComments.filter((c) => c.postId === postId && c.visible);
}

// ─── Mod-Queue Reports ────────────────────────────────────────────────────
// Iter 40: Alle Demo-Reports entfernt — kommen in Phase 2 aus echten User-Reports.
export const reports: Report[] = [];
