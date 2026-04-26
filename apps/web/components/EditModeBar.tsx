"use client";
import { useEffect, useState } from "react";
import { Pencil, Save, Plus, Trash2, Eye } from "lucide-react";
import type { Role } from "@traderiq/api";

interface EditModeBarProps {
  role: Role;
  scope: string;
}

/**
 * Sichtbar nur für ADMIN, OWNER, STAFF (Spec §11/§17).
 * Schaltet "Bearbeitungsmodus" für die aktuelle Seite ein:
 * - Tabs/Sektionen können hinzugefügt/entfernt/umbenannt werden
 * - Inhalte können inline editiert werden
 * - Onboarding & Pitch werden direkt im Depot statt im Admin-Backend gepflegt
 *
 * Phase 1: Mock-Toggle (UI-Demo).
 * Phase 2: persistiert via PATCH-Endpunkten.
 */
export function EditModeBar({ role, scope }: EditModeBarProps) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (role !== "ADMIN" && role !== "OWNER" && role !== "STAFF") return null;
  if (!mounted) return null;

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm transition ${
        editing ? "border-brand bg-brand/5" : "border-dashed border-border bg-muted/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <Pencil className={`h-4 w-4 ${editing ? "text-brand" : "text-muted-foreground"}`} />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {editing ? `Bearbeitungsmodus aktiv · ${scope}` : `Bearbeitungsmodus · ${scope}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {editing && (
          <>
            <button className="btn-secondary inline-flex items-center gap-1" title="Sektion hinzufügen">
              <Plus className="h-3.5 w-3.5" /> Sektion
            </button>
            <button className="btn-secondary inline-flex items-center gap-1" title="Inhalt bearbeiten">
              <Pencil className="h-3.5 w-3.5" /> Inhalt
            </button>
            <button className="btn-secondary inline-flex items-center gap-1 text-destructive" title="Sektion entfernen">
              <Trash2 className="h-3.5 w-3.5" /> Entfernen
            </button>
          </>
        )}
        <button
          onClick={() => setEditing(!editing)}
          className={editing ? "btn-brand inline-flex items-center gap-1" : "btn-secondary inline-flex items-center gap-1"}
        >
          {editing ? (
            <>
              <Save className="h-3.5 w-3.5" /> Speichern & Schließen
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Seite bearbeiten
            </>
          )}
        </button>
      </div>
    </div>
  );
}
