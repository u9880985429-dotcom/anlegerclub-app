"use client";
import { useMemo, useState } from "react";
import { X, Plus, Search, Sparkles } from "lucide-react";
import { WIDGET_REGISTRY } from "./widgets/registry";
import type { WidgetCatalogEntry } from "./widgets/types";
import { WidgetThumbnail } from "./WidgetThumbnail";

type Category = WidgetCatalogEntry["category"];

const CATEGORY_BADGE: Record<Category, string> = {
  Kennzahl: "bg-brand/15 text-brand",
  Verlauf: "bg-blue-500/15 text-blue-700",
  Vergleich: "bg-purple-500/15 text-purple-700",
  Verteilung: "bg-emerald-500/15 text-emerald-700",
  Funnel: "bg-amber-500/15 text-amber-700",
  Tabelle: "bg-slate-500/15 text-slate-700",
  Heatmap: "bg-rose-500/15 text-rose-700",
};

export function WidgetGallery({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: WidgetCatalogEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");

  const categories = useMemo(
    () => Array.from(new Set(WIDGET_REGISTRY.map((w) => w.category))) as Category[],
    [],
  );
  const filtered = useMemo(() => {
    return WIDGET_REGISTRY.filter((w) => {
      if (category !== "all" && w.category !== category) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || (w.inspiration?.toLowerCase().includes(q) ?? false);
    });
  }, [query, category]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-base flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-4 w-4 text-brand" /> Widget-Bibliothek
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {WIDGET_REGISTRY.length} verfuegbare Charts inspired by Excel-/Sales-/Analytics-Dashboards. Klick „Hinzufuegen" → erscheint sofort im Dashboard.
            </p>
          </div>
          <button onClick={onClose} aria-label="Schliessen" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Suche nach Name, Beschreibung, Inspiration ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-base h-8 w-full pl-8 text-xs"
            />
          </div>
          <button
            onClick={() => setCategory("all")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              category === "all" ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            Alle ({WIDGET_REGISTRY.length})
          </button>
          {categories.map((c) => {
            const count = WIDGET_REGISTRY.filter((w) => w.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  category === c ? "bg-brand text-white" : `${CATEGORY_BADGE[c]} hover:opacity-80`
                }`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>

        <div className="grid flex-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
              Kein Widget passt zu deiner Suche.
            </div>
          ) : (
            filtered.map((w) => (
              <article key={w.id} className="flex flex-col overflow-hidden rounded-md border border-border bg-card transition hover:border-brand/40 hover:shadow-md">
                <WidgetThumbnail entry={w} />
                <div className="flex flex-1 flex-col p-3">
                  <div className="mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold leading-tight">{w.title}</h4>
                      <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase ${CATEGORY_BADGE[w.category]}`}>
                        {w.category}
                      </span>
                    </div>
                    {w.inspiration && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        <em>{w.inspiration}</em>
                      </div>
                    )}
                  </div>
                  <p className="flex-1 text-[11px] text-muted-foreground">{w.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {w.defaultCols} / 12 Spalten
                    </span>
                    <button onClick={() => onAdd(w)} className="btn-brand inline-flex items-center gap-1 text-xs">
                      <Plus className="h-3 w-3" /> Hinzufuegen
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
