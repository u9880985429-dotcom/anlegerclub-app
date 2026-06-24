"use client";
import { useEffect, useMemo, useState } from "react";
import { X, Check, Search, Sparkles, ArrowRightLeft, Database, ExternalLink } from "lucide-react";
import { WIDGET_REGISTRY } from "./widgets/registry";
import type { WidgetCatalogEntry } from "./widgets/types";
import type { WidgetInstance, WidgetSize } from "@/lib/kpi-config";
import { WidgetThumbnail } from "./WidgetThumbnail";
import { DATA_SOURCES, DEFAULT_DATA_SOURCE_ID, findDataSource } from "./widgets/dataSources";

const COLS_OPTIONS: WidgetSize[] = [3, 4, 6, 8, 12];

const CATEGORY_BADGE: Record<WidgetCatalogEntry["category"], string> = {
  Kennzahl: "bg-brand/15 text-brand",
  Verlauf: "bg-blue-500/15 text-blue-700",
  Vergleich: "bg-purple-500/15 text-purple-700",
  Verteilung: "bg-emerald-500/15 text-emerald-700",
  Funnel: "bg-amber-500/15 text-amber-700",
  Tabelle: "bg-slate-500/15 text-slate-700",
  Heatmap: "bg-rose-500/15 text-rose-700",
};

export function WidgetSettingsModal({
  instance,
  catalogEntry,
  onClose,
  onSave,
  onSwap,
}: {
  instance: WidgetInstance;
  catalogEntry: WidgetCatalogEntry;
  onClose: () => void;
  onSave: (next: WidgetInstance) => void;
  onSwap: (newWidgetId: string) => void;
}) {
  const [tab, setTab] = useState<"general" | "data" | "swap">("general");
  const [title, setTitle] = useState(instance.title ?? "");
  const [cols, setCols] = useState<WidgetSize>(instance.cols);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | WidgetCatalogEntry["category"]>("all");
  // Datenquelle aus instance.settings lesen, default: demo.static
  const initialDsId = (instance.settings?.dataSourceId as string | undefined) ?? DEFAULT_DATA_SOURCE_ID;
  const [dataSourceId, setDataSourceId] = useState(initialDsId);
  const initialCustomUrl = (instance.settings?.customEndpoint as string | undefined) ?? "";
  const [customEndpoint, setCustomEndpoint] = useState(initialCustomUrl);
  const initialCustomLabel = (instance.settings?.customLabel as string | undefined) ?? "";
  const [customLabel, setCustomLabel] = useState(initialCustomLabel);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const swappable = useMemo(() => {
    return WIDGET_REGISTRY.filter((w) => {
      if (w.id === instance.widgetId) return false;
      if (category !== "all" && w.category !== category) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    });
  }, [query, category, instance.widgetId]);

  const categories = useMemo(
    () => Array.from(new Set(WIDGET_REGISTRY.map((w) => w.category))),
    [],
  );

  function save() {
    const settings: Record<string, unknown> = { ...(instance.settings ?? {}) };
    settings.dataSourceId = dataSourceId;
    if (dataSourceId === "custom") {
      settings.customEndpoint = customEndpoint.trim();
      settings.customLabel = customLabel.trim() || undefined;
    } else {
      delete settings.customEndpoint;
      delete settings.customLabel;
    }
    onSave({
      ...instance,
      title: title.trim() ? title.trim() : undefined,
      cols,
      settings,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="card-base flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-4 w-4 text-brand" /> Widget-Einstellungen
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <strong>{catalogEntry.title}</strong>{" "}
              <span className={`ml-1 rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase ${CATEGORY_BADGE[catalogEntry.category]}`}>
                {catalogEntry.category}
              </span>
            </p>
          </div>
          <button onClick={onClose} aria-label="Schliessen" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/20 px-4">
          <button
            onClick={() => setTab("general")}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition ${
              tab === "general" ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Allgemein
          </button>
          <button
            onClick={() => setTab("data")}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition ${
              tab === "data" ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Database className="h-3 w-3" /> Datenquelle
            </span>
          </button>
          <button
            onClick={() => setTab("swap")}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition ${
              tab === "swap" ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <ArrowRightLeft className="h-3 w-3" /> Widget austauschen
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "general" && (
            <div className="space-y-4">
              <Field label="Eigener Titel (optional)">
                <input
                  className="input-base"
                  placeholder={catalogEntry.title}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Leer lassen → Standard-Titel „{catalogEntry.title}". Wird im Widget-Header angezeigt.
                </p>
              </Field>

              <Field label="Spaltenbreite (Grid)">
                <div className="flex flex-wrap gap-1.5">
                  {COLS_OPTIONS.map((c) => {
                    const isAllowed = catalogEntry.allowedCols.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={!isAllowed}
                        onClick={() => setCols(c)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                          !isAllowed
                            ? "cursor-not-allowed border-border text-muted-foreground/40"
                            : cols === c
                              ? "border-brand bg-brand text-white"
                              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {c} / 12
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Erlaubt fuer diesen Widget-Typ: {catalogEntry.allowedCols.join(", ")} von 12. Standard: {catalogEntry.defaultCols}.
                </p>
              </Field>

              <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Beschreibung:</strong> {catalogEntry.description}
                {catalogEntry.inspiration && (
                  <>
                    <br />
                    <em>Inspiration: {catalogEntry.inspiration}</em>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "data" && (
            <DataSourceTab
              dataSourceId={dataSourceId}
              setDataSourceId={setDataSourceId}
              customEndpoint={customEndpoint}
              setCustomEndpoint={setCustomEndpoint}
              customLabel={customLabel}
              setCustomLabel={setCustomLabel}
              widgetCategory={catalogEntry.category}
            />
          )}

          {tab === "swap" && (
            <div>
              <p className="mb-3 text-xs text-muted-foreground">
                Tausche dieses Widget gegen ein anderes aus — Position und Groesse bleiben erhalten.
              </p>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px] flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Suche ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input-base h-8 w-full pl-8 text-xs"
                  />
                </div>
                <button
                  onClick={() => setCategory("all")}
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                    category === "all" ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  Alle
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                      category === c ? "bg-brand text-white" : `${CATEGORY_BADGE[c]} hover:opacity-80`
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {swappable.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-xs text-muted-foreground">
                    Keine Widgets zum Tauschen verfuegbar.
                  </div>
                ) : (
                  swappable.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onSwap(w.id)}
                      className="group flex flex-col overflow-hidden rounded-md border border-border bg-card text-left transition hover:border-brand/40 hover:shadow-md"
                    >
                      <WidgetThumbnail entry={w} />
                      <div className="flex-1 p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold leading-tight">{w.title}</h4>
                          <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase ${CATEGORY_BADGE[w.category]}`}>
                            {w.category}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{w.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(tab === "general" || tab === "data") && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/10 p-3">
            <button onClick={onClose} className="btn-ghost">Abbrechen</button>
            <button onClick={save} className="btn-brand inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Speichern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold">{label}</span>
      {children}
    </label>
  );
}

function DataSourceTab({
  dataSourceId,
  setDataSourceId,
  customEndpoint,
  setCustomEndpoint,
  customLabel,
  setCustomLabel,
  widgetCategory,
}: {
  dataSourceId: string;
  setDataSourceId: (id: string) => void;
  customEndpoint: string;
  setCustomEndpoint: (v: string) => void;
  customLabel: string;
  setCustomLabel: (v: string) => void;
  widgetCategory: WidgetCatalogEntry["category"];
}) {
  const selected = findDataSource(dataSourceId);
  const recommended = DATA_SOURCES.filter((d) => d.recommendedFor.includes(widgetCategory));
  const others = DATA_SOURCES.filter((d) => !d.recommendedFor.includes(widgetCategory));

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-brand/20 bg-brand/5 p-3 text-xs">
        <strong className="text-brand">Datenquelle</strong> bestimmt, woher die Werte fuer dieses Widget geladen werden. Phase 1: Auswahl wird gespeichert + im Widget-Header angezeigt. Phase 2: der DynamicGridLoader ruft den ausgewaehlten Endpoint mit den aktuellen Filtern auf.
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Empfohlen fuer „{widgetCategory}"-Widgets
        </h4>
        <div className="space-y-2">
          {recommended.map((d) => (
            <DataSourceCard
              key={d.id}
              source={d}
              selected={dataSourceId === d.id}
              onSelect={() => setDataSourceId(d.id)}
            />
          ))}
        </div>
      </div>

      {others.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Weitere Datenquellen
          </h4>
          <div className="space-y-2">
            {others.map((d) => (
              <DataSourceCard
                key={d.id}
                source={d}
                selected={dataSourceId === d.id}
                onSelect={() => setDataSourceId(d.id)}
              />
            ))}
          </div>
        </div>
      )}

      {dataSourceId === "custom" && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <Field label="Custom Endpoint-URL (HTTPS)">
            <input
              className="input-base font-mono text-xs"
              placeholder="https://api.example.com/kpi/...."
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              JSON muss Top-Level-Felder wie <code>byMonth</code>, <code>byProduct</code>, <code>totalRevenue</code> liefern.
            </p>
          </Field>
          <Field label="Anzeige-Name (optional)">
            <input
              className="input-base"
              placeholder="z.B. „GA4 Conversions"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />
          </Field>
        </div>
      )}

      {selected && selected.id !== "custom" && (
        <div className="rounded-md border border-dashed border-border bg-muted/10 p-3 text-xs">
          <div className="mb-1 inline-flex items-center gap-1 font-semibold">
            <ExternalLink className="h-3 w-3" />
            Aktuelle Auswahl: {selected.label}
          </div>
          <div className="mt-1 space-y-1 text-muted-foreground">
            <div>
              <strong className="text-foreground">Endpoint:</strong> <code className="font-mono">{selected.method} {selected.endpoint}</code>
            </div>
            <div>
              <strong className="text-foreground">Speist:</strong> {selected.feeds.join(", ")}
            </div>
            <div>
              <strong className="text-foreground">Provider:</strong> {selected.provider}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataSourceCard({
  source,
  selected,
  onSelect,
}: {
  source: typeof DATA_SOURCES[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`block w-full rounded-md border p-3 text-left transition ${
        selected
          ? "border-brand bg-brand/10"
          : "border-border bg-card hover:border-brand/40 hover:bg-muted/30"
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
              selected ? "border-brand bg-brand" : "border-border bg-card"
            }`}
          >
            {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
          <h5 className="text-sm font-semibold">{source.label}</h5>
        </div>
        <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold uppercase ${
          source.provider === "ablefy" ? "bg-orange-500/15 text-orange-700" :
          source.provider === "internal" ? "bg-emerald-500/15 text-emerald-700" :
          "bg-purple-500/15 text-purple-700"
        }`}>
          {source.provider}
        </span>
      </div>
      <p className="mb-1.5 text-xs text-muted-foreground">{source.description}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <code className="font-mono text-muted-foreground">{source.method} {source.endpoint}</code>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-muted-foreground">Speist: {source.feeds.join(", ")}</span>
      </div>
    </button>
  );
}
