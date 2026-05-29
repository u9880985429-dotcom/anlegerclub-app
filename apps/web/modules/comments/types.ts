/**
 * comments-Modul — TYPEN (rein, ohne Datenzugriff).
 *
 * Der Domaenentyp `Comment` kommt (vorerst) aus `@traderiq/api`. Der Import
 * ist rein typseitig (zur Laufzeit entfernt), zieht also keine Mock-Daten mit.
 * Bei Stufe 7 (eigenes domain-Paket) wandert `Comment` dorthin.
 */

export type { Comment } from "@traderiq/api";

export interface InsertCommentInput {
  postId: string;
  authorId: string;
  authorName: string;
  authorIsTeam: boolean;
  authorTeamBadge: string | null;
  bodyMd: string;
  parentId?: string | null;
}
