"use client";
import { useEffect, useState } from "react";
import {
  Plus, ChevronUp, ChevronDown, Trash2, Maximize2, RotateCcw, Layout,
  Sparkles, MoreHorizontal, Settings, ArrowRightLeft, RefreshCw, Download,
} from "lucide-react";
import {
  readKpiConfig, writeKpiConfig, resetKpiConfig, generateInstanceId, DEFAULT_LAYOUT,
  type KpiDashboardConfig, type WidgetInstance, type WidgetSize,
} from "@/lib/kpi-config";
import { findWidget } from "./widgets/registry";
import type { WidgetData } from "./widgets/types";
import { WidgetGallery } from "./WidgetGallery";
import { WidgetSettingsModal } from "./WidgetSettingsModal";

const COLS_OPTIONS: WidgetSize[] = [3, 4, 6, 8, 12];

export function DynamicGrid({ data }: { data: WidgetData }) {
  const [config, setConfig] = useState<KpiDashboardConfig>({ widgets: DEFAULT_LAYOUT, schemaVersion: 1 });
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [settingsIdx, setSettingsIdx] = useState<number | null>(null);
  const [refreshFlash, setRefreshFlash] = useState<string | null>(null);

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
    setSettingsIdx(null);
  }

  function resizeWidget(idx: number, cols: WidgetSize) {
    const next = [...config.widgets];
    next[idx] = { ...next[idx]!, cols };
    persist({ ...config, widgets: next });
  }

  function updateInstance(idx: number, updated: WidgetInstance) {
    const next = [...config.widgets];
    next[idx] = updated;
    persist({ ...config, widgets: next });
    setSettingsIdx(null);
  }

  function swapWidget(idx: number, newWidgetId: string) {
    const next = [...config.widgets];
    const newEntry = findWidget(newWidgetId);
    const currentCols = next[idx]!.cols;
    const allowed = newEntry?.allowedCols ?? COLS_OPTIONS;
    const cols: WidgetSize = allowed.includes(currentCols) ? currentCols : (newEntry?.defaultCols ?? 6);
    next[idx] = {
      ...next[idx]!,
      widgetId: newWidgetId,
      cols,
      // Title-Override beim Swap entfernen — neuer Widget bekommt seinen eigenen Default-Titel
      title: undefined,
    };
    persist({ ...config, widgets: next });
    setSettingsIdx(null);
  }

  function addWidget(widgetId: string, cols: WidgetSize) {
    const inst: WidgetInstance = { instanceId: generateInstanceId(), widgetId, cols };
    persist({ ...config, widgets: [...config.widgets, inst] });
    setGalleryOpen(false);
  }

  function refreshWidget(idx: number) {
    const inst = config.widgets[idx];
    if (!inst) return;
    setRefreshFlash(inst.instanceId);
    setTimeout(() => setRefreshFlash(null), 1200);
    // Phase 2: triggert echtes Re-Fetch der Datenquelle.
  }

  function exportCsv(idx: number) {
    const inst = config.widgets[idx];
    const entry = inst ? findWidget(inst.widgetId) : undefined;
    if (!inst || !entry) return;
    const filename = `${entry.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    const header = ["widget", "title", "category", "exported_at"].join(",");
    const row = [entry.id, inst.title ?? entry.title, entry.category, new Date().toISOString()].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
    const blob = new Blob([header + "\n" + row + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    // Phase 2: echte Datenzeilen statt Metadata-Stub.
  }

  function reset() {
    if (!confirm("Layout auf Standard zuruecksetzen? Alle eigenen Aenderungen gehen verloren.")) return;
    resetKpiConfig();
    setConfig(readKpiConfig());
  }

  if (!mounted) return null;

  const settingsInstance = settingsIdx !== null ? config.widgets[settingsIdx] : null;
  const settingsEntry = settingsInstance ? findWidget(settingsInstance.widgetId) : null;

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
                  Unbekanntes Widget: <code>{inst.widgetId}</code>{" "}
                  <button onClick={() => removeWidget(idx)} className="ml-2 underline hover:no-underline">entfernen</button>
                </div>
              );
            }
            return (
              <div
                key={inst.instanceId}
                className={`group relative col-span-12 ${colSpanClass(inst.cols)} ${refreshFlash === inst.instanceId ? "animate-pulse" : ""}`}
              >
                {/* Schwebendes Action-Menue: immer sichtbar oben rechts */}
                <div className="pointer-events-none absolute right-2 top-2 z-20 flex items-start gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  {editMode && (
                    <div className="pointer-events-auto flex gap-1 rounded-md border border-border bg-card p-1 shadow-sm">
                      <IconButton onClick={() => moveWidget(idx, -1)} disabled={idx === 0} icon={ChevronUp} label="Nach oben" />
                      <IconButton onClick={() => moveWidget(idx, 1)} disabled={idx === config.widgets.length - 1} icon={ChevronDown} label="Nach unten" />
                      <ResizePicker
                        current={inst.cols}
                        allowed={entry.allowedCols}
                        onPick={(c) => resizeWidget(idx, c)}
                      />
                    </div>
                  )}
                  <div className="pointer-events-auto rounded-md border border-border bg-card p-1 shadow-sm">
                    <ActionMenu
                      onSettings={() => setSettingsIdx(idx)}
                      onSwap={() => setSettingsIdx(idx)}
                      onRefresh={() => refreshWidget(idx)}
                      onExportCsv={() => exportCsv(idx)}
                      onRemove={() => removeWidget(idx)}
                    />
                  </div>
                </div>
                {/* Custom-Title-Indikator (falls gesetzt) */}
                {inst.title && (
                  <div className="absolute left-3 top-3 z-10 rounded-md bg-brand/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand">
                    {inst.title}
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

      {settingsInstance && settingsEntry && (
        <WidgetSettingsModal
          instance={settingsInstance}
          catalogEntry={settingsEntry}
          onClose={() => setSettingsIdx(null)}
          onSave={(next) => updateInstance(settingsIdx!, next)}
          onSwap={(newId) => swapWidget(settingsIdx!, newId)}
        />
      )}
    </div>
  );
}

function IconButton({
  onClick,
  disabled,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function ActionMenu({
  onSettings,
  onSwap,
  onRefresh,
  onExportCsv,
  onRemove,
}: {
  onSettings: () => void;
  onSwap: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-widget-action-menu="true"]')) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div data-widget-action-menu="true" className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Aktionen"
        title="Aktionen"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          <MenuItem icon={RefreshCw} label="Aktualisieren" onClick={() => { setOpen(false); onRefresh(); }} />
          <MenuItem icon={ArrowRightLeft} label="Widget austauschen" onClick={() => { setOpen(false); onSwap(); }} />
          <MenuItem icon={Settings} label="Einstellungen" onClick={() => { setOpen(false); onSettings(); }} />
          <div className="my-1 border-t border-border" />
          <MenuItem icon={Download} label="Als CSV exportieren" onClick={() => { setOpen(false); onExportCsv(); }} />
          <div className="my-1 border-t border-border" />
          <MenuItem icon={Trash2} label="Entfernen" destructive onClick={() => { setOpen(false); onRemove(); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition ${
        destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent"
      }`}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      {label}
    </button>
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
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-resize-picker="true"]')) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div data-resize-picker="true" className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Groesse"
        title={`Groesse: ${current}/12`}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-32 rounded-md border border-border bg-card py-1 shadow-lg">
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
