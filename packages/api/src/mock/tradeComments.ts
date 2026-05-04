/**
 * Trade-spezifische Diskussion (Spec §10).
 * Jeder Trade hat seine eigene "Mini-Community".
 */

import type { Comment } from "../types";
import { allTrades } from "./trades";

// Iter 40: Test-Kommentare entfernt — Trade-Diskussionen entstehen ab Phase 2
// durch echte Mitglieder-Beitraege.
export const tradeComments: Comment[] = [];

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
