"use client";
import { useEffect, useState } from "react";
import { Pencil, Save, Plus, Trash2, Eye, X, Check } from "lucide-react";
import type { Role } from "@traderiq/api";

interface EditModeBarProps {
  role: Role;
  scope: string;
}

interface Section {
  id: string;
  label: string;
  hidden?: boolean;
}

/**
 * Funktionaler Edit-Mode für ADMIN/OWNER/STAFF (Spec §11/§17).
 * Phase 1: lokale Demo-Edits zur Veranschaulichung.
 * Phase 2: persistiert via PATCH-Endpunkten + Audit-Log.
 */
export function EditModeBar({ role, scope }: EditModeBarProps) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (role !== "ADMIN" && role !== "OWNER" && role !== "STAFF") return null;
  if (!mounted) return null;

  function addSection() {
    if (!newSectionLabel.trim()) return;
    setSections([...sections, { id: `s_${Date.now()}`, label: newSectionLabel.trim() }]);
    setNewSectionLabel("");
    setShowAddInput(false);
  }

  function removeSection(id: string) {
    setSections(sections.filter((s) => s.id !== id));
  }

  function toggleHidden(id: string) {
    setSections(sections.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)));
  }

  function saveAll() {
    setSavedAt(new Date().toLocaleTimeString("de-DE"));
    setTimeout(() => setSavedAt(null), 4000);
    setEditing(false);
  }

  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-2 text-sm transition ${
        editing ? "border-brand bg-brand/5" : "border-dashed border-border bg-muted/40"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pencil className={`h-4 w-4 ${editing ? "text-brand" : "text-muted-foreground"}`} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {editing ? `Bearbeitungsmodus aktiv · ${scope}` : `Bearbeitungsmodus · ${scope}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setShowAddInput(!showAddInput)}
                className="btn-secondary inline-flex items-center gap-1"
                title="Neue Sektion hinzufügen"
              >
                <Plus className="h-3.5 w-3.5" /> Sektion
              </button>
              <button onClick={saveAll} className="btn-brand inline-flex items-center gap-1">
                <Save className="h-3.5 w-3.5" /> Speichern & Schließen
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost inline-flex items-center gap-1" title="Abbrechen">
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> Seite bearbeiten
            </button>
          )}
        </div>
      </div>

      {editing && showAddInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSection();
          }}
          className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2"
        >
          <input
            value={newSectionLabel}
            onChange={(e) => setNewSectionLabel(e.target.value)}
            placeholder={'Name der neuen Sektion (z. B. „Webinar-Aufzeichnungen")'}
            className="input-base h-9 flex-1 min-w-[200px] text-sm"
            autoFocus
          />
          <button type="submit" className="btn-brand inline-flex items-center gap-1 text-xs">
            <Check className="h-3.5 w-3.5" /> Hinzufügen
          </button>
        </form>
      )}

      {editing && sections.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hinzugefügte Sektionen (Demo)</div>
          {sections.map((s) => (
            <div key={s.id} className={`flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-xs ${s.hidden ? "opacity-50" : ""}`}>
              <span>
                {s.hidden && <span className="badge-base mr-2">versteckt</span>}
                {s.label}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleHidden(s.id)} className="rounded p-1 text-muted-foreground hover:text-foreground" title={s.hidden ? "Sichtbar machen" : "Verstecken"}>
                  {s.hidden ? <Eye className="h-3 w-3" /> : <Eye className="h-3 w-3 line-through" />}
                </button>
                <button onClick={() => removeSection(s.id)} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Entfernen">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedAt && (
        <div className="mt-2 text-xs text-profit">✓ Gespeichert um {savedAt} (Demo · Phase 2: persistiert in DB).</div>
      )}
    </div>
  );
}
