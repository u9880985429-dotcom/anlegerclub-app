import type { Comment, Community, Post, ProductSlug, Report } from "../types";

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
  const pinned: Post[] = PIN_TITLES.map((title, i) => ({
    id: `p_${community.id}_pin_${i}`,
    communityId: community.id,
    authorId: "u_admin",
    authorName: "Admin Trader IQ",
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

  const regular: Post[] = POST_TEMPLATES.map((t, i) => ({
    id: `p_${community.id}_${i}`,
    communityId: community.id,
    authorId: t.authorId,
    authorName: t.author,
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
  }));

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
const COMMENT_TEMPLATES = [
  { author: "Klaus Berger", authorId: "u_klaus", body: "Sehe ich genauso. Bei mir war die Lernkurve in den ersten 3 Monaten am steilsten." },
  { author: "Anna Huber", authorId: "u_anna", body: "Ich warte immer 30 Min nach Eröffnung – die Volatilität direkt zur Eröffnung verfälscht oft die Stops." },
  { author: "Mira Schulz", authorId: "u_mira", body: "Im Trade Journal findest du die exakten Anpassungen mit Zeitstempel. 👍" },
  { author: "Jonas Weiß", authorId: "u_jonas", body: "Danke für den Hinweis – kalender ist bei mir eingetragen." },
];

export const allComments: Comment[] = allPosts.flatMap((p, idx) =>
  Array.from({ length: p.commentCount }).map((_, i) => {
    const tpl = COMMENT_TEMPLATES[(idx + i) % COMMENT_TEMPLATES.length]!;
    return {
      id: `cm_${p.id}_${i}`,
      postId: p.id,
      authorId: tpl.authorId,
      authorName: tpl.author,
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
    reporterName: "Anna Huber",
    postId: allPosts[5]?.id ?? null,
    commentId: null,
    reason: "Vermutete Werbung für Drittprodukt",
    status: "OPEN",
    createdAt: "2026-04-24T14:23:00Z",
  },
  {
    id: "rep_2",
    reporterId: "u_klaus",
    reporterName: "Klaus Berger",
    postId: null,
    commentId: allComments[0]?.id ?? null,
    reason: "Kommentar enthält Beleidigung",
    status: "OPEN",
    createdAt: "2026-04-25T09:11:00Z",
  },
  {
    id: "rep_3",
    reporterId: "u_petra",
    reporterName: "Petra Fischer",
    postId: allPosts[2]?.id ?? null,
    commentId: null,
    reason: "Off-Topic",
    status: "RESOLVED",
    createdAt: "2026-04-22T18:45:00Z",
  },
];
