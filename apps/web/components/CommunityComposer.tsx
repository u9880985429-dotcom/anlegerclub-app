"use client";
import { useState } from "react";
import { Send, AlertTriangle, ShieldCheck } from "lucide-react";
import { filterText } from "@traderiq/api";
import { SmileyPicker } from "./SmileyPicker";

interface CommunityComposerProps {
  placeholder?: string;
  /** Visual context for moderators only (above the input). */
  contextHint?: string;
}

/**
 * Spec §10:
 * - Beleidigungen werden mit Sternen maskiert + Hinweis an Mods.
 * - Werbe-Patterns blockieren das Absenden komplett.
 * - Nur die definierten Smileys aus ALLOWED_REACTIONS sind verfügbar.
 */
export function CommunityComposer({ placeholder = "Was möchtest du teilen?", contextHint }: CommunityComposerProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "blocked"; reason: string }
    | { kind: "warning"; reason: string }
    | { kind: "ok" }
  >({ kind: "idle" });

  function insertEmoji(e: string) {
    setText((t) => `${t}${t.endsWith(" ") || t === "" ? "" : " "}${e} `);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const result = filterText(text);
    if (result.blocked) {
      setStatus({
        kind: "blocked",
        reason:
          "Wir haben Hinweise auf Werbung für externe Produkte/Dienste oder verdächtige Links erkannt. Bitte überarbeite deinen Beitrag oder kontaktiere die Moderation.",
      });
      return;
    }
    if (result.flaggedProfanity.length > 0) {
      setText(result.cleaned);
      setStatus({
        kind: "warning",
        reason: `Beleidigungen wurden automatisch maskiert (${result.flaggedProfanity.length} Wort/e). Beitrag wurde abgesendet, die Moderation wurde informiert.`,
      });
      return;
    }
    setStatus({ kind: "ok" });
    setText("");
  }

  return (
    <form onSubmit={submit} className="card-base p-4">
      {contextHint && (
        <div className="mb-2 text-xs text-muted-foreground">{contextHint}</div>
      )}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus({ kind: "idle" });
        }}
        placeholder={placeholder}
        rows={3}
        className="input-base h-auto min-h-[80px] resize-y"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SmileyPicker onPick={insertEmoji} />
          <span className="text-[11px] text-muted-foreground">
            Hinweis: Werbung wird blockiert · Beleidigungen werden maskiert.
          </span>
        </div>
        <button type="submit" disabled={!text.trim()} className="btn-brand inline-flex items-center gap-2">
          <Send className="h-4 w-4" /> Posten
        </button>
      </div>

      {status.kind === "blocked" && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{status.reason}</span>
        </div>
      )}
      {status.kind === "warning" && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{status.reason}</span>
        </div>
      )}
      {status.kind === "ok" && (
        <div className="mt-3 rounded-md border border-profit/40 bg-profit/5 p-3 text-xs text-profit">
          Beitrag wurde abgesendet (Demo: nur lokal). Push/Mail-Webhook wird in Phase 2 ausgelöst.
        </div>
      )}
    </form>
  );
}
