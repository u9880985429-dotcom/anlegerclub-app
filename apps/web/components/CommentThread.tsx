"use client";
import { useState } from "react";
import { CornerDownRight, Send } from "lucide-react";
import { filterText } from "@traderiq/api";
import type { Comment } from "@traderiq/api";
import { LikeButton } from "./LikeButton";
import { SmileyPicker } from "./SmileyPicker";
import { formatRelative } from "@/lib/format";

interface CommentThreadProps {
  comments: Comment[];
  /** Eingeloggter User – Avatar-Initialen für neue Antworten. */
  currentUser: { name: string; role: string };
}

interface LocalComment extends Comment {
  children?: LocalComment[];
}

function nest(comments: Comment[]): LocalComment[] {
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

export function CommentThread({ comments, currentUser }: CommentThreadProps) {
  const [list, setList] = useState<Comment[]>(comments);
  const tree = nest(list);

  function addReply(parentId: string | null, text: string): boolean {
    const result = filterText(text);
    if (result.blocked) return false;
    const c: Comment = {
      id: `cm_local_${Date.now()}`,
      postId: list[0]?.postId ?? "",
      parentId,
      authorId: "u_local",
      authorName: currentUser.name,
      bodyMd: result.cleaned,
      visible: true,
      createdAt: new Date().toISOString(),
    };
    setList((prev) => [...prev, c]);
    return true;
  }

  if (list.length === 0) {
    return (
      <div className="card-base p-6 text-center text-sm text-muted-foreground">
        Noch keine Diskussion. Sei der Erste!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tree.map((c) => (
        <CommentNode key={c.id} comment={c} depth={0} addReply={addReply} />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  depth,
  addReply,
}: {
  comment: LocalComment;
  depth: number;
  /** Reply-Funktion — jeder Knoten antwortet an seine eigene id. */
  addReply: (parentId: string, text: string) => boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const ok = addReply(comment.id, text);
    if (!ok) {
      setErrorMsg("⚠️ Werbung blockiert. Bitte überarbeite deine Antwort.");
      return;
    }
    setText("");
    setReplyOpen(false);
    setErrorMsg(null);
  }

  function pickEmoji(e: string) {
    setText((t) => `${t}${t.endsWith(" ") || t === "" ? "" : " "}${e} `);
  }

  // Visuelle Einrückung – capped bei depth 4 für Lesbarkeit
  const cappedDepth = Math.min(depth, 4);
  const ml = cappedDepth * 20;

  return (
    <article
      className={`card-base p-4 ${depth > 0 ? "border-l-2 border-brand/30" : ""}`}
      style={{ marginLeft: ml }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        {depth > 0 && <CornerDownRight className="h-3 w-3 text-brand" />}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
          {comment.authorName.split(" ").map((n) => n.charAt(0)).slice(0, 2).join("")}
        </div>
        <span className="font-semibold">{comment.authorName}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{formatRelative(comment.createdAt)}</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-line">{comment.bodyMd}</p>
      <div className="mt-2 flex items-center gap-2">
        <LikeButton initialCount={Math.floor(((comment.id.charCodeAt(comment.id.length - 1) ?? 0) % 7))} />
        <button
          type="button"
          onClick={() => setReplyOpen(!replyOpen)}
          className="text-xs font-semibold text-brand hover:underline"
        >
          {replyOpen ? "Abbrechen" : `Antworten an ${comment.authorName.split(" ")[0]}`}
        </button>
      </div>

      {replyOpen && (
        <form onSubmit={handleReply} className="mt-3 rounded-md border border-border bg-muted/30 p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-base min-h-[60px] resize-y"
            placeholder={`Antwort an ${comment.authorName}…`}
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <SmileyPicker onPick={pickEmoji} />
            <button type="submit" disabled={!text.trim()} className="btn-brand inline-flex items-center gap-1 text-xs">
              <Send className="h-3 w-3" /> Antwort senden
            </button>
          </div>
          {errorMsg && <div className="mt-2 text-xs text-destructive">{errorMsg}</div>}
        </form>
      )}

      {(comment.children ?? []).length > 0 && (
        <div className="mt-3 space-y-3">
          {(comment.children ?? []).map((c) => (
            <CommentNode key={c.id} comment={c} depth={depth + 1} addReply={addReply} />
          ))}
        </div>
      )}
    </article>
  );
}
