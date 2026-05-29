/**
 * Oeffentliche API des comments-Moduls ("die Tuer").
 * Andere Module/Seiten/Routen importieren NUR von hier (`@/modules/comments`).
 */

export type { Comment, InsertCommentInput } from "./types";
export { listCommentsByPost, insertComment } from "./repository";
