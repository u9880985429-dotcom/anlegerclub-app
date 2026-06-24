"use client";
import { useState } from "react";
import { Eye, EyeOff, Pencil, Save, X } from "lucide-react";

interface TradeAdminToolbarProps {
  tradeId: string;
  initialVisible: boolean;
  initialTitle: string;
  initialBody: string;
}

/**
 * Funktionaler Edit-Mode für Mitarbeiter (Demo): Trade sichtbar/unsichtbar,
 * Titel + Body inline editierbar. Phase 1: lokale State-Mutation.
 * Phase 2: PATCH /api/trades/:id mit Audit-Log.
 */
export function TradeAdminToolbar({ tradeId, initialVisible, initialTitle, initialBody }: TradeAdminToolbarProps) {
  const [visible, setVisible] = useState(initialVisible);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function save() {
    setSavedAt(new Date().toLocaleTimeString("de-DE"));
    setEditing(false);
  }

  return (
    <div className="mb-4 rounded-lg border border-brand/40 bg-brand/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">
          Bearbeitungsmodus · Trade #{tradeId.slice(0, 8)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisible(!visible)}
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              visible
                ? "border-profit/40 bg-profit/10 text-profit"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700"
            }`}
            title={visible ? "Trade ist sichtbar – auf Klick verstecken" : "Trade ist versteckt – auf Klick einblenden"}
          >
            {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {visible ? "Sichtbar" : "Versteckt"}
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-brand hover:text-brand"
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "Abbrechen" : "Inhalt bearbeiten"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 space-y-2 rounded-md border border-border bg-card p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base font-semibold"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-base h-32 resize-y font-mono text-xs"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Änderungen werden gespeichert und sind danach für Mitglieder sichtbar.</span>
            <button onClick={save} className="btn-brand inline-flex items-center gap-1">
              <Save className="h-3.5 w-3.5" /> Speichern
            </button>
          </div>
        </div>
      )}

      {savedAt && (
        <div className="mt-2 text-xs text-profit">✓ Gespeichert um {savedAt}.</div>
      )}

      {!visible && (
        <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-700">
          ⚠️ Dieser Trade ist <strong>versteckt</strong>. Mitglieder sehen ihn nicht. Klick „Sichtbar" zum erneuten Veröffentlichen.
        </div>
      )}
    </div>
  );
}
