/**
 * Trade-spezifische Diskussion (Spec §10).
 * Jeder Trade hat seine eigene "Mini-Community".
 */

import type { Comment } from "../types";
import { allTrades } from "./trades";

const TEMPLATES = [
  { author: "Anna Huber", authorId: "u_anna", body: "Stop wie immer auf Tagestief? Bin dabei, Position aufgebaut. 💪" },
  { author: "Klaus Berger", authorId: "u_klaus", body: "Habe noch eine kleine Resttranche, der Trend schaut gut aus." },
  { author: "Mira Schulz", authorId: "u_mira", body: "Erinnerung: bei IB sollte man auf Premarket-Liquidität achten – ggf. auf Open warten." },
  { author: "Jonas Weiß", authorId: "u_jonas", body: "Danke für die schnelle Info – Roll bei mir bereits ausgeführt. ✅" },
  { author: "Petra Fischer", authorId: "u_petra", body: "Bin neu hier – könnt ihr die Stop-Anpassung kurz konkret machen?" },
];

export const tradeComments: Comment[] = allTrades.flatMap((t, idx) =>
  Array.from({ length: 2 + (idx % 3) }).map((_, i) => {
    const tpl = TEMPLATES[(idx + i) % TEMPLATES.length]!;
    return {
      id: `tc_${t.id}_${i}`,
      postId: t.id, // wir verwenden trade.id als "post-Anker"
      authorId: tpl.authorId,
      authorName: tpl.author,
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
