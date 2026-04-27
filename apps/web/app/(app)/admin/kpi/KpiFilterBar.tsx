"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter, Calendar, Package, User, RefreshCw, Loader2, X, Database, Sparkles,
} from "lucide-react";

interface SalesAgent {
  id: string;
  name: string;
  role: string;
}

interface AblefyAggregate {
  invoicesFetched: number;
  paid: number;
  open: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
}

const PRODUCTS = [
  { value: "all", label: "Alle Depots" },
  { value: "starter", label: "Starter Depot" },
  { value: "trend", label: "Trend Depot" },
  { value: "stillhalter", label: "Stillhalter Depot" },
  { value: "cockpit", label: "Trader Cockpit" },
  { value: "all-access", label: "All-Access" },
];

const PRESETS = [
  { value: "today", label: "Heute" },
  { value: "last_7_days", label: "Letzte 7 Tage" },
  { value: "last_30_days", label: "Letzte 30 Tage" },
  { value: "this_month", label: "Aktueller Monat" },
  { value: "last_month", label: "Letzter Monat" },
  { value: "this_quarter", label: "Aktuelles Quartal" },
  { value: "ytd", label: "Year-to-Date" },
  { value: "custom", label: "Benutzerdefiniert" },
];

export function KpiFilterBar({ salesAgents }: { salesAgents: SalesAgent[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState(searchParams.get("product") ?? "all");
  const [preset, setPreset] = useState(searchParams.get("preset") ?? "last_30_days");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");
  const [agent, setAgent] = useState(searchParams.get("agent") ?? "all");
  const [syncing, setSyncing] = useState(false);
  const [aggregate, setAggregate] = useState<AblefyAggregate | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("traderiq:kpi:aggregate");
      if (cached) {
        const parsed = JSON.parse(cached);
        setAggregate(parsed.aggregate);
        setLastSyncAt(parsed.ts);
        setUsingLiveData(true);
      }
    } catch {}
  }, []);

  function applyFilters() {
    const params = new URLSearchParams();
    if (product !== "all") params.set("product", product);
    if (preset !== "last_30_days") params.set("preset", preset);
    if (preset === "custom") {
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
    }
    if (agent !== "all") params.set("agent", agent);
    router.push(`/admin/kpi${params.toString() ? "?" + params.toString() : ""}`);
  }

  function reset() {
    setProduct("all");
    setPreset("last_30_days");
    setDateFrom("");
    setDateTo("");
    setAgent("all");
    router.push("/admin/kpi");
  }

  async function syncFromAblefy() {
    setSyncing(true);
    setError(null);
    try {
      const cfgRaw = localStorage.getItem("traderiq:ablefy-config");
      if (!cfgRaw) throw new Error("Ablefy ist nicht konfiguriert. Geh zu /admin/integrations/ablefy.");
      const cfg = JSON.parse(cfgRaw) as { apiKey: string; apiSecret: string };
      if (!cfg.apiKey || !cfg.apiSecret) throw new Error("API-Key oder Secret fehlt.");

      const range = computeDateRange(preset, dateFrom, dateTo);
      const res = await fetch("/api/v1/ablefy/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          apiSecret: cfg.apiSecret,
          dateFrom: range.from,
          dateTo: range.to,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Sync fehlgeschlagen");

      const ts = new Date().toISOString();
      localStorage.setItem("traderiq:kpi:aggregate", JSON.stringify({ aggregate: json.aggregate, ts }));
      setAggregate(json.aggregate);
      setLastSyncAt(ts);
      setUsingLiveData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync fehlgeschlagen");
    } finally {
      setSyncing(false);
    }
  }

  const hasFilters = product !== "all" || preset !== "last_30_days" || agent !== "all";

  return (
    <div className="mb-6 space-y-3">
      <div className="card-base p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter & Datenquelle
          </h2>
          {usingLiveData ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-0.5 text-[10px] font-semibold text-profit">
              <Database className="h-3 w-3" /> Live-Daten aus Ablefy
              {lastSyncAt && (
                <span className="ml-1 font-normal text-profit/80">
                  · {new Date(lastSyncAt).toLocaleString("de-DE")}
                </span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              <Sparkles className="h-3 w-3" /> Demo-Daten — fuer Echtdaten Sync ausloesen
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Produkt" icon={Package}>
            <select className="input-base" value={product} onChange={(e) => setProduct(e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Zeitraum" icon={Calendar}>
            <select className="input-base" value={preset} onChange={(e) => setPreset(e.target.value)}>
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>

          {preset === "custom" ? (
            <>
              <Field label="Von" icon={Calendar}>
                <input type="date" className="input-base" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </Field>
              <Field label="Bis" icon={Calendar}>
                <input type="date" className="input-base" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </Field>
            </>
          ) : (
            <Field label="Sales-Agent" icon={User}>
              <select className="input-base" value={agent} onChange={(e) => setAgent(e.target.value)}>
                <option value="all">Alle Mitarbeiter</option>
                {salesAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.role === "SALES" ? "(Sales)" : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {preset === "custom" && (
          <div className="mt-3">
            <Field label="Sales-Agent" icon={User}>
              <select className="input-base max-w-md" value={agent} onChange={(e) => setAgent(e.target.value)}>
                <option value="all">Alle Mitarbeiter</option>
                {salesAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.role === "SALES" ? "(Sales)" : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={applyFilters} className="btn-brand inline-flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter anwenden
          </button>
          <button onClick={syncFromAblefy} disabled={syncing} className="btn-secondary inline-flex items-center gap-2">
            {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {syncing ? "Lade Daten ..." : "Aus Ablefy synchronisieren"}
          </button>
          {hasFilters && (
            <button onClick={reset} className="btn-ghost inline-flex items-center gap-1 text-xs">
              <X className="h-3.5 w-3.5" /> Filter zuruecksetzen
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-loss/10 p-2 text-xs text-loss">⚠️ {error}</div>
        )}

        {aggregate && (
          <div className="mt-4 grid gap-2 rounded-md border border-profit/30 bg-profit/5 p-3 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Rechnungen" value={aggregate.invoicesFetched.toLocaleString("de-DE")} />
            <Stat label="Bezahlt" value={aggregate.paid.toLocaleString("de-DE")} />
            <Stat label="Offen" value={aggregate.open.toLocaleString("de-DE")} />
            <Stat label="Storniert" value={aggregate.cancelled.toLocaleString("de-DE")} />
            <Stat label="Erstattet" value={aggregate.refunded.toLocaleString("de-DE")} />
            <Stat label="Umsatz" value={`${aggregate.totalRevenue.toFixed(2).replace(".", ",")} €`} accent />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 inline-flex items-center gap-1 font-semibold text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono font-semibold ${accent ? "text-profit" : ""}`}>{value}</div>
    </div>
  );
}

function computeDateRange(preset: string, customFrom: string, customTo: string): { from?: string; to?: string } {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  switch (preset) {
    case "today":
      return { from: iso(today), to: iso(today) };
    case "last_7_days":
      return { from: iso(new Date(today.getTime() - 7 * 86400000)), to: iso(today) };
    case "last_30_days":
      return { from: iso(new Date(today.getTime() - 30 * 86400000)), to: iso(today) };
    case "this_month":
      return { from: iso(startOfMonth(today)), to: iso(today) };
    case "last_month": {
      const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return { from: iso(lm), to: iso(endOfMonth(lm)) };
    }
    case "this_quarter": {
      const q = Math.floor(today.getMonth() / 3);
      return { from: iso(new Date(today.getFullYear(), q * 3, 1)), to: iso(today) };
    }
    case "ytd":
      return { from: iso(new Date(today.getFullYear(), 0, 1)), to: iso(today) };
    case "custom":
      return { from: customFrom || undefined, to: customTo || undefined };
    default:
      return {};
  }
}
