"use client";
import { useEffect, useState } from "react";
import {
  Plus, ChevronUp, ChevronDown, Trash2, Maximize2, RotateCcw, Layout,
  Sparkles,
} from "lucide-react";
import {
  readKpiConfig, writeKpiConfig, resetKpiConfig, generateInstanceId, DEFAULT_LAYOUT,
  type KpiDashboardConfig, type WidgetInstance, type WidgetSize,
} from "@/lib/kpi-config";
import { findWidget } from "./widgets/registry";
import type { WidgetData } from "./widgets/types";
import { WidgetGallery } from "./WidgetGallery";

const COLS_OPTIONS: WidgetSize[] = [3, 4, 6, 8, 12];

export function DynamicGrid({ data }: { data: WidgetData }) {
  const [config, setConfig] = useState<KpiDashboardConfig>({ widgets: DEFAULT_LAYOUT, schemaVersion: 1 });
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConfig(readKpiConfig());
    function onChange(e: Event) {
      const detail = (e as CustomEvent<KpiDashboardConfig>).detail;
      if (detail) setConfig(detail);
    }
    window.addEventListener("traderiq:kpi-config-change", onChange as EventListener);
    return () => window.removeEventListener("traderiq:kpi-config-change", onChange as EventListener);
  }, []);

  function persist(next: KpiDashboardConfig) {
    setConfig(next);
    writeKpiConfig(next);
  }

  function moveWidget(idx: number, dir: -1 | 1) {
    const next = [...config.widgets];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    persist({ ...config, widgets: next });
  }

  function removeWidget(idx: number) {
    if (!confirm("Widget aus dem Dashboard entfernen?")) return;
    persist({ ...config, widgets: config.widgets.filter((_, i) => i !== idx) });
  }

  function resizeWidget(idx: number, cols: WidgetSize) {
    const next = [...config.widgets];
    next[idx] = { ...next[idx]!, cols };
    persist({ ...config, widgets: next });
  }

  function addWidget(widgetId: string, cols: WidgetSize) {
    const inst: WidgetInstance = { instanceId: generateInstanceId(), widgetId, cols };
    persist({ ...config, widgets: [...config.widgets, inst] });
    setGalleryOpen(false);
  }

  function reset() {
    if (!confirm("Layout auf Standard zuruecksetzen? Alle eigenen Aenderungen gehen verloren.")) return;
    resetKpiConfig();
    setConfig(readKpiConfig());
  }

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card-base flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Layout className="h-3.5 w-3.5" />
          <span><strong className="text-foreground">{config.widgets.length}</strong> Widgets aktiv</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Layout-Aenderungen werden lokal gespeichert (ueberlebt Pushes/Deploys)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
              editMode ? "border-brand bg-brand text-white" : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layout className="h-3.5 w-3.5" /> {editMode ? "Bearbeitung beenden" : "Layout bearbeiten"}
          </button>
          <button onClick={() => setGalleryOpen(true)} className="btn-brand inline-flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Widget hinzufuegen
          </button>
          <button onClick={reset} className="btn-ghost inline-flex items-center gap-1 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Standard
          </button>
        </div>
      </div>

      {/* Grid */}
      {config.widgets.length === 0 ? (
        <div className="card-base flex flex-col items-center gap-2 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-sm font-medium">Dein Dashboard ist leer</div>
          <div className="max-w-md text-xs text-muted-foreground">
            Klick „Widget hinzufuegen", um aus der Bibliothek zu waehlen — KPI-Karten, Verlaufs-Charts, Verteilungs-Donuts, Funnels, Tabellen.
          </div>
          <button onClick={() => setGalleryOpen(true)} className="btn-brand mt-3 inline-flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Erstes Widget aussuchen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {config.widgets.map((inst, idx) => {
            const entry = findWidget(inst.widgetId);
            if (!entry) {
              return (
                <div key={inst.instanceId} className="col-span-12 rounded-md border border-loss/30 bg-loss/5 p-3 text-xs text-loss">
                  Unbekanntes Widget: <code>{inst.widgetId}</code> — entferne es oder waehle ein anderes.
                </div>
              );
            }
            return (
              <div
                key={inst.instanceId}
                className={`relative col-span-12 ${colSpanClass(inst.cols)}`}
              >
                {editMode && (
                  <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-md border border-border bg-card p-1 shadow-sm">
                    <button
                      onClick={() => moveWidget(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                      aria-label="Nach oben"
                      title="Nach oben"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveWidget(idx, 1)}
                      disabled={idx === config.widgets.length - 1}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                      aria-label="Nach unten"
                      title="Nach unten"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <ResizePicker
                      current={inst.cols}
                      allowed={entry.allowedCols}
                      onPick={(c) => resizeWidget(idx, c)}
                    />
                    <button
                      onClick={() => removeWidget(idx)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                      aria-label="Entfernen"
                      title="Entfernen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {entry.render(data, inst.settings)}
              </div>
            );
          })}
        </div>
      )}

      <WidgetGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onAdd={(entry) => addWidget(entry.id, entry.defaultCols)}
      />
    </div>
  );
}

function ResizePicker({
  current,
  allowed,
  onPick,
}: {
  current: WidgetSize;
  allowed: WidgetSize[];
  onPick: (c: WidgetSize) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Groesse"
        title={`Groesse: ${current}/12`}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-border bg-card py-1 shadow-lg">
          {COLS_OPTIONS.map((c) => {
            const isAllowed = allowed.includes(c);
            return (
              <button
                key={c}
                disabled={!isAllowed}
                onClick={() => {
                  onPick(c);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-2 py-1 text-left text-xs transition ${
                  !isAllowed
                    ? "cursor-not-allowed text-muted-foreground/40"
                    : current === c
                      ? "bg-brand/10 text-brand"
                      : "text-foreground hover:bg-accent"
                }`}
              >
                <span>{c} / 12 Spalten</span>
                {current === c && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function colSpanClass(cols: WidgetSize): string {
  switch (cols) {
    case 3:
      return "lg:col-span-3 md:col-span-6";
    case 4:
      return "lg:col-span-4 md:col-span-6";
    case 6:
      return "lg:col-span-6";
    case 8:
      return "lg:col-span-8";
    case 12:
      return "col-span-12";
  }
}
