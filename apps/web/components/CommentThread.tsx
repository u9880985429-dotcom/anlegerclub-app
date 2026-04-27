"use client";
import { useState } from "react";
import { CornerDownRight, Send, MoreVertical, Pencil, Trash2, EyeOff, X, Check } from "lucide-react";
import { filterText } from "@traderiq/api";
import type { Comment, Role } from "@traderiq/api";
import { LikeButton } from "./LikeButton";
import { SmileyPicker } from "./SmileyPicker";
import { AttachmentInput, type Attachment } from "./AttachmentInput";
import { formatRelative } from "@/lib/format";

interface CommentThreadProps {
  comments: Comment[];
  /** Eingeloggter User – Avatar-Initialen + Rechte für Edit/Delete. */
  currentUser: { id?: string; name: string; role: Role };
}

interface LocalComment extends Comment {
  children?: LocalComment[];
  /** lokal gelöschte/versteckte Kommentare bleiben in der Liste, werden aber nicht angezeigt. */
  deleted?: boolean;
  /** vom Mod versteckt — sichtbar im Mod-Kontext, aber für Member nicht. */
  hidden?: boolean;
  /** lokale Bearbeitung (Edit-Diff). */
  editedAt?: string;
}

function nest(comments: LocalComment[]): LocalComment[] {
  const map = new Map<string, LocalComment>();
  comments.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: LocalComment[] = [];
  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

function isMod(role: Role): boolean {
  return role === "MODERATOR" || role === "ADMIN" || role === "STAFF" || role === "OWNER";
}

export function CommentThread({ comments, currentUser }: CommentThreadProps) {
  const [list, setList] = useState<LocalComment[]>(comments);
  const tree = nest(list);

  function addReply(parentId: string, text: string): boolean {
    const result = filterText(text);
    if (result.blocked) return false;
    const c: LocalComment = {
      id: `cm_local_${Date.now()}`,
      postId: list[0]?.postId ?? "",
      parentId,
      authorId: currentUser.id ?? "u_local",
      authorName: currentUser.name,
      authorIsTeam: isMod(currentUser.role),
      bodyMd: result.cleaned,
      visible: true,
      createdAt: new Date().toISOString(),
    };
    setList((prev) => [...prev, c]);
    return true;
  }

  function editComment(id: string, newBody: string): boolean {
    const result = filterText(newBody);
    if (result.blocked) return false;
    setList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, bodyMd: result.cleaned, editedAt: new Date().toISOString() } : c)),
    );
    return true;
  }

  function deleteComment(id: string) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, deleted: true } : c)));
  }

  function hideComment(id: string) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, hidden: true } : c)));
  }

  if (list.filter((c) => !c.deleted).length === 0) {
    return (
      <div className="card-base p-6 text-center text-sm text-muted-foreground">
        Noch keine Diskussion. Sei der Erste!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tree.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          depth={0}
          currentUser={currentUser}
          onReply={addReply}
          onEdit={editComment}
          onDelete={deleteComment}
          onHide={hideComment}
        />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  depth,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onHide,
}: {
  comment: LocalComment;
  depth: number;
  currentUser: { id?: string; name: string; role: Role };
  onReply: (parentId: string, text: string) => boolean;
  onEdit: (id: string, body: string) => boolean;
  onDelete: (id: string) => void;
  onHide: (id: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.bodyMd);
  const [menuOpen, setMenuOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cappedDepth = Math.min(depth, 4);
  const ml = cappedDepth * 20;

  // Falls gelöscht: leerer Marker statt Inhalt (wird in Mod-Sicht später per visible/hidden gesteuert).
  if (comment.deleted) {
    return (
      <article
        className="card-base bg-muted/40 p-3 italic text-muted-foreground"
        style={{ marginLeft: ml }}
      >
        <div className="text-xs">— Kommentar gelöscht —</div>
        {(comment.children ?? []).length > 0 && (
          <div className="mt-3 space-y-3">
            {(comment.children ?? []).map((c) => (
              <CommentNode
                key={c.id}
                comment={c}
                depth={depth + 1}
                currentUser={currentUser}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onHide={onHide}
              />
            ))}
          </div>
        )}
      </article>
    );
  }

  // Falls vom Mod versteckt: Member sieht Hinweis statt Inhalt.
  if (comment.hidden && !isMod(currentUser.role)) {
    return (
      <article
        className="card-base border-amber-500/40 bg-amber-500/5 p-3 italic text-amber-800"
        style={{ marginLeft: ml }}
      >
        <div className="text-xs">⚠️ Dieser Kommentar wurde von einem Moderator versteckt.</div>
      </article>
    );
  }

  const isOwn = currentUser.id && currentUser.id === comment.authorId;
  const canEditOwn = isOwn === true; // Eigene Kommentare bearbeiten
  const canDeleteOwn = isOwn === true; // Eigene Kommentare löschen
  const canModerate = isMod(currentUser.role) && !isOwn; // Fremde Kommentare moderieren

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;
    const ok = onReply(comment.id, replyText);
    if (!ok) {
      setErrorMsg("⚠️ Werbung blockiert. Bitte überarbeite deine Antwort.");
      return;
    }
    setReplyText("");
    setReplyAttachments([]);
    setReplyOpen(false);
    setErrorMsg(null);
    setUploadError(null);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editText.trim()) return;
    const ok = onEdit(comment.id, editText);
    if (!ok) {
      setErrorMsg("⚠️ Beitrag enthält Werbung — Bearbeitung blockiert.");
      return;
    }
    setEditing(false);
    setErrorMsg(null);
  }

  return (
    <article
      className={`card-base p-4 ${depth > 0 ? "border-l-2 border-brand/30" : ""} ${comment.hidden ? "border-amber-500/40 bg-amber-500/5" : ""}`}
      style={{ marginLeft: ml }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        {depth > 0 && <CornerDownRight className="h-3 w-3 text-brand" />}
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
            comment.authorIsTeam ? "bg-brand text-white" : "bg-muted"
          }`}
        >
          {comment.authorName
            .split(" ")
            .map((n) => n.charAt(0))
            .slice(0, 2)
            .join("")}
        </div>
        <span className="font-semibold">{comment.authorName}</span>
        {comment.authorIsTeam && comment.authorTeamBadge && (
          <span className="inline-flex items-center rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            {comment.authorTeamBadge}
          </span>
        )}
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{formatRelative(comment.createdAt)}</span>
        {comment.editedAt && (
          <span className="text-muted-foreground italic">· bearbeitet</span>
        )}
        {comment.hidden && (
          <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            versteckt
          </span>
        )}

        {/* Aktions-Menü (3 Punkte rechts) */}
        {(canEditOwn || canDeleteOwn || canModerate) && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Aktionen"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
                {canEditOwn && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setEditText(comment.bodyMd);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                  </button>
                )}
                {canDeleteOwn && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Kommentar wirklich löschen?")) {
                        onDelete(comment.id);
                      }
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-destructive transition hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Löschen
                  </button>
                )}
                {canModerate && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onHide(comment.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-amber-700 transition hover:bg-amber-500/10"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Verstecken (Mod)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Kommentar dauerhaft löschen?")) {
                          onDelete(comment.id);
                        }
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-xs text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Löschen (Mod)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body / Edit-Form */}
      {editing ? (
        <form onSubmit={handleEditSubmit} className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="input-base min-h-[80px] resize-y"
            autoFocus
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditText(comment.bodyMd);
                setErrorMsg(null);
              }}
              className="btn-secondary inline-flex items-center gap-1 text-xs"
            >
              <X className="h-3 w-3" /> Abbrechen
            </button>
            <button type="submit" className="btn-brand inline-flex items-center gap-1 text-xs">
              <Check className="h-3 w-3" /> Speichern
            </button>
          </div>
          {errorMsg && <div className="mt-1 text-xs text-destructive">{errorMsg}</div>}
        </form>
      ) : (
        <p className="whitespace-pre-line text-sm leading-relaxed">{comment.bodyMd}</p>
      )}

      {/* Action-Bar */}
      {!editing && (
        <div className="mt-2 flex items-center gap-2">
          <LikeButton initialCount={Math.floor((comment.id.charCodeAt(comment.id.length - 1) ?? 0) % 7)} />
          <button
            type="button"
            onClick={() => setReplyOpen(!replyOpen)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            {replyOpen ? "Abbrechen" : `Antworten an ${comment.authorName.split(" ")[0]}`}
          </button>
        </div>
      )}

      {/* Reply-Form */}
      {replyOpen && (
        <form onSubmit={handleReplySubmit} className="mt-3 rounded-md border border-border bg-muted/30 p-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="input-base min-h-[60px] resize-y"
            placeholder={`Antwort an ${comment.authorName}…`}
            autoFocus
          />

          <AttachmentInput
            attachments={replyAttachments}
            setAttachments={setReplyAttachments}
            userRole={currentUser.role}
            onError={setUploadError}
            compact
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SmileyPicker onPick={(e) => setReplyText((t) => `${t}${t.endsWith(" ") || t === "" ? "" : " "}${e} `)} />
            </div>
            <button
              type="submit"
              disabled={!replyText.trim() && replyAttachments.length === 0}
              className="btn-brand inline-flex items-center gap-1 text-xs"
            >
              <Send className="h-3 w-3" /> Antwort senden
            </button>
          </div>
          {uploadError && <div className="mt-2 text-xs text-amber-700">⚠️ {uploadError}</div>}
          {errorMsg && <div className="mt-2 text-xs text-destructive">{errorMsg}</div>}
        </form>
      )}

      {(comment.children ?? []).length > 0 && (
        <div className="mt-3 space-y-3">
          {(comment.children ?? []).map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              depth={depth + 1}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onHide={onHide}
            />
          ))}
        </div>
      )}
    </article>
  );
}
