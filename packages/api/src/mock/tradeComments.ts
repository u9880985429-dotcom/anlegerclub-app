/**
 * Trade-spezifische Diskussion (Spec §10).
 * Jeder Trade hat seine eigene "Mini-Community".
 */

import type { Comment, Role } from "../types";
import { allTrades } from "./trades";
import { getPublicDisplayName, getTeamBadge, isTeamRole } from "./displayName";

const AUTHORS: Record<string, { firstName: string; lastName: string; role: Role; isTeamMember?: boolean }> = {
  u_anna: { firstName: "Anna", lastName: "Huber", role: "MEMBER" },
  u_klaus: { firstName: "Klaus", lastName: "Berger", role: "MEMBER" },
  u_mira: { firstName: "Mira", lastName: "Schulz", role: "MODERATOR", isTeamMember: false },
  u_jonas: { firstName: "Jonas", lastName: "Weiß", role: "MEMBER" },
  u_petra: { firstName: "Petra", lastName: "Fischer", role: "MEMBER" },
};

const TEMPLATES: { authorId: string; body: string }[] = [
  { authorId: "u_anna", body: "Stop wie immer auf Tagestief? Bin dabei, Position aufgebaut. 💪" },
  { authorId: "u_klaus", body: "Habe noch eine kleine Resttranche, der Trend schaut gut aus." },
  { authorId: "u_mira", body: "Erinnerung: bei IB sollte man auf Premarket-Liquidität achten – ggf. auf Open warten." },
  { authorId: "u_jonas", body: "Danke für die schnelle Info – Roll bei mir bereits ausgeführt. ✅" },
  { authorId: "u_petra", body: "Bin neu hier – könnt ihr die Stop-Anpassung kurz konkret machen?" },
];

export const tradeComments: Comment[] = allTrades.flatMap((t, idx) =>
  Array.from({ length: 2 + (idx % 3) }).map((_, i) => {
    const tpl = TEMPLATES[(idx + i) % TEMPLATES.length]!;
    const meta = AUTHORS[tpl.authorId]!;
    return {
      id: `tc_${t.id}_${i}`,
      postId: t.id,
      authorId: tpl.authorId,
      authorName: getPublicDisplayName(meta),
      authorIsTeam: isTeamRole(meta.role, meta.isTeamMember),
      authorTeamBadge: getTeamBadge(meta),
      bodyMd: tpl.body,
      parentId: null,
      visible: true,
      createdAt: new Date(Date.parse(t.date) + (i + 1) * 3 * 60 * 60 * 1000).toISOString(),
    };
  }),
);

export interface TradeReactionState {
  tradeId: string;
  reactions: { emoji: string; count: number }[];
}

export const tradeReactions: TradeReactionState[] = allTrades.map((t, idx) => ({
  tradeId: t.id,
  reactions: [
    { emoji: "👍", count: 8 + ((idx * 5) % 17) },
    { emoji: "🔁", count: 2 + ((idx * 3) % 7) },
    { emoji: "📈", count: 1 + ((idx * 2) % 5) },
  ],
}));

export function getCommentsByTrade(tradeId: string): Comment[] {
  return tradeComments.filter((c) => c.postId === tradeId && c.visible);
}

export function getReactionsByTrade(tradeId: string) {
  return tradeReactions.find((r) => r.tradeId === tradeId)?.reactions ?? [];
}

export function getTradeById(tradeId: string) {
  return allTrades.find((t) => t.id === tradeId);
}
