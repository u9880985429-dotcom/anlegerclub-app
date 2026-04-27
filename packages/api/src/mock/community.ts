import type { Comment, Community, Post, ProductSlug, Report } from "../types";
import { getPublicDisplayName, getTeamBadge, isTeamRole } from "./displayName";

/**
 * Author-Roll-Map: bestimmt wie der Name dieses Autors öffentlich dargestellt wird.
 * Quelle der Wahrheit für Autor-Rolle + Team-Status. Synchron zu users.ts.
 */
const AUTHOR_META: Record<string, { firstName: string; lastName: string; role: import("../types").Role; isTeamMember?: boolean }> = {
  u_admin: { firstName: "Admin", lastName: "Trader IQ", role: "STAFF", isTeamMember: true },
  u_max: { firstName: "Max", lastName: "Bauer", role: "STAFF", isTeamMember: true },
  u_mira: { firstName: "Mira", lastName: "Schulz", role: "MODERATOR", isTeamMember: false }, // aus MEMBER befördert
  u_anna: { firstName: "Anna", lastName: "Huber", role: "MEMBER" },
  u_klaus: { firstName: "Klaus", lastName: "Berger", role: "MEMBER" },
  u_jonas: { firstName: "Jonas", lastName: "Weiß", role: "MEMBER" },
  u_petra: { firstName: "Petra", lastName: "Fischer", role: "MEMBER" },
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

const POST_TEMPLATES: { author: string; authorId: string; title?: string; body: string }[] = [
  { author: "Anna Huber", authorId: "u_anna", title: "Erste 6 Monate – meine Erfahrungen", body: "Wollte mal kurz Danke sagen. Seit ich systematisch nach den Signalen handle, habe ich nicht nur eine bessere Performance, sondern bin auch deutlich entspannter. Wer hat ähnliche Erfahrungen?" },
  { author: "Klaus Berger", authorId: "u_klaus", title: "Frage zu Stop-Anpassungen", body: "Wenn die Stops am Wochenende nachgezogen werden – setzt ihr die direkt am Montag-Open oder wartet ihr eine Stunde nach Eröffnung?" },
  { author: "Mira Schulz", authorId: "u_mira", body: "Kurzer Hinweis: Das Q1-Webinar ist morgen 19:00 Uhr live. Aufzeichnung kommt 24h später ins Archiv. 🎙️" },
  { author: "Jonas Weiß", authorId: "u_jonas", title: "Broker-Wechsel Erfahrung", body: "Bin von Comdirect zu Interactive Brokers gewechselt. Margin-Anforderungen sind massiv niedriger, dafür ist die UX gewöhnungsbedürftig. Würdet ihr es wieder so machen?" },
  { author: "Petra Fischer", authorId: "u_petra", body: "Frage an die Stillhalter-Profis: bei welchem Delta verkauft ihr in der aktuellen IV-Umgebung?" },
  { author: "Anna Huber", authorId: "u_anna", body: "Habe heute den ersten Roll auf MCD ausgeführt – Prämie diff. +0,42 USD. Lohnt sich definitiv über die Zeit." },
  { author: "Klaus Berger", authorId: "u_klaus", title: "Steuern auf Optionsprämien", body: "Hat jemand einen guten Steuerberater fürs Optionshandel-Thema? Mein bisheriger ist überfordert. 😅" },
  { author: "Mira Schulz", authorId: "u_mira", body: "Heads-up: Fed-Sitzung morgen Abend. Ich reduziere bewusst meine Delta-Exposure vor dem Statement." },
];

const PIN_TITLES = [
  "📌 Willkommen in der Community – bitte Hausregeln lesen",
  "📌 Wichtig: So funktionieren Erwähnungen & Tags",
];

function buildPostsFor(community: Community): Post[] {
  const now = Date.now();
  const adminMeta = authorMetaFor("u_admin");
  const pinned: Post[] = PIN_TITLES.map((title, i) => ({
    id: `p_${community.id}_pin_${i}`,
    communityId: community.id,
    authorId: "u_admin",
    authorName: publicNameFor("u_admin", "Admin", "Trader IQ"),
    authorIsTeam: adminMeta.isTeam,
    authorTeamBadge: adminMeta.badge,
    title,
    bodyMd: i === 0
      ? "Hier herrscht ein freundlicher, respektvoller Ton. Keine Anlageberatung, keine Empfehlungen für Drittprodukte, keine Werbung. Bei Fragen meldet euch bei einem Mod."
      : "Erwähne andere Mitglieder mit `@vorname.nachname`. Nutze Hashtags wie `#trade-idee`, `#frage`, `#feedback` für bessere Auffindbarkeit.",
    pinned: true,
    visible: true,
    hiddenById: null,
    reactions: [
      { emoji: "👍", count: 12 + i * 3 },
      { emoji: "🙏", count: 4 },
    ],
    commentCount: 2,
    createdAt: new Date(now - (30 + i) * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const regular: Post[] = POST_TEMPLATES.map((t, i) => {
    const meta = AUTHOR_META[t.authorId];
    const teamMeta = authorMetaFor(t.authorId);
    return {
    id: `p_${community.id}_${i}`,
    communityId: community.id,
    authorId: t.authorId,
    authorName: publicNameFor(t.authorId, meta?.firstName ?? t.author.split(" ")[0]!, meta?.lastName ?? t.author.split(" ").slice(1).join(" ")),
    authorIsTeam: teamMeta.isTeam,
    authorTeamBadge: teamMeta.badge,
    title: t.title ?? null,
    bodyMd: t.body,
    pinned: false,
    visible: i !== 4 || community.productSlug !== "starter", // 1 hidden post in starter for mod-queue demo
    hiddenById: i === 4 && community.productSlug === "starter" ? "u_admin" : null,
    reactions: [
      { emoji: "👍", count: ((i * 7) % 17) + 1 },
      { emoji: "🔥", count: ((i * 3) % 9) + 1 },
      { emoji: "🚀", count: (i * 2) % 6 },
    ].filter((r) => r.count > 0),
    commentCount: ((i * 3) % 4) + 1,
    createdAt: new Date(now - i * 6 * 60 * 60 * 1000).toISOString(),
  };
  });

  return [...pinned, ...regular];
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
const COMMENT_TEMPLATES: { authorId: string; body: string }[] = [
  { authorId: "u_klaus", body: "Sehe ich genauso. Bei mir war die Lernkurve in den ersten 3 Monaten am steilsten." },
  { authorId: "u_anna", body: "Ich warte immer 30 Min nach Eröffnung – die Volatilität direkt zur Eröffnung verfälscht oft die Stops." },
  { authorId: "u_mira", body: "Im Trade Journal findest du die exakten Anpassungen mit Zeitstempel. 👍" },
  { authorId: "u_jonas", body: "Danke für den Hinweis – Kalender ist bei mir eingetragen." },
];

// Echte Beleidigungs-Mock-Beispiele für die Mod-Queue (intern, in der UI maskiert).
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

export const allComments: Comment[] = allPosts.flatMap((p, idx) =>
  Array.from({ length: p.commentCount }).map((_, i) => {
    const tpl = COMMENT_TEMPLATES[(idx + i) % COMMENT_TEMPLATES.length]!;
    const meta = AUTHOR_META[tpl.authorId];
    const teamMeta = authorMetaFor(tpl.authorId);
    return {
      id: `cm_${p.id}_${i}`,
      postId: p.id,
      authorId: tpl.authorId,
      authorName: publicNameFor(tpl.authorId, meta?.firstName ?? "User", meta?.lastName ?? ""),
      authorIsTeam: teamMeta.isTeam,
      authorTeamBadge: teamMeta.badge,
      bodyMd: tpl.body,
      parentId: null,
      visible: true,
      createdAt: new Date(Date.parse(p.createdAt) + (i + 1) * 60 * 60 * 1000).toISOString(),
    };
  }),
);

export function getCommentsByPost(postId: string): Comment[] {
  return allComments.filter((c) => c.postId === postId && c.visible);
}

// ─── Mod-Queue Reports ────────────────────────────────────────────────────
export const reports: Report[] = [
  {
    id: "rep_1",
    reporterId: "u_anna",
    reporterName: publicNameFor("u_anna", "Anna", "Huber"),
    postId: allPosts[5]?.id ?? null,
    commentId: null,
    reason: "Vermutete Werbung für Drittprodukt (Telegram-Link im Post)",
    status: "OPEN",
    createdAt: "2026-04-24T14:23:00Z",
  },
  {
    id: "rep_2",
    reporterId: "u_klaus",
    reporterName: publicNameFor("u_klaus", "Klaus", "Berger"),
    postId: null,
    commentId: moderationFlaggedComments[0]!.id,
    reason: 'Beleidigung („Vollidiot") – automatisch maskiert',
    status: "OPEN",
    createdAt: "2026-04-25T09:11:00Z",
  },
  {
    id: "rep_3",
    reporterId: "u_petra",
    reporterName: publicNameFor("u_petra", "Petra", "Fischer"),
    postId: null,
    commentId: moderationFlaggedComments[1]!.id,
    reason: 'Schwere Beleidigung („Hurensohn") – automatisch maskiert',
    status: "OPEN",
    createdAt: "2026-04-26T11:02:00Z",
  },
  {
    id: "rep_4",
    reporterId: "u_mira",
    reporterName: publicNameFor("u_mira", "Mira", "Schulz"),
    postId: allPosts[2]?.id ?? null,
    commentId: null,
    reason: "Off-Topic – kein Bezug zum Trade",
    status: "RESOLVED",
    createdAt: "2026-04-22T18:45:00Z",
  },
];
