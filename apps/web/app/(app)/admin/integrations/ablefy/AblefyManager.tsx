"use client";
import { useEffect, useRef, useState } from "react";
import {
  Eye, EyeOff, Copy, Check, Loader2, Send, RefreshCw, Plus, Trash2,
  CheckCircle2, AlertTriangle, Webhook, Key, Package, Activity, ExternalLink,
} from "lucide-react";
import {
  readAblefyConfig, writeAblefyConfig, getAblefyWebhookUrl,
  type AblefyConfig, type AblefyProductMapping,
} from "@/lib/ablefy-config";
import type { AblefyLookupHintRecord } from "@/lib/ablefy-store";
import type { ProductSlug } from "@traderiq/api";

const PRODUCT_OPTIONS: { value: ProductSlug; label: string }[] = [
  { value: "starter", label: "Starter Depot" },
  { value: "trend", label: "Trend Depot" },
  { value: "stillhalter", label: "Stillhalter Depot" },
  { value: "cockpit", label: "Trader Cockpit" },
  { value: "all-access", label: "All Access Pass" },
];

/**
 * Standard-Mappings fuer den Anlegerclub All Access Pass. Drei Varianten
 * mit identischem TraderIQ-Slug ("all-access") aber unterschiedlichen
 * Plan-Labels — wird im Backend (User-Detail) zur Variante-Anzeige genutzt.
 *
 * Der "Quick-Add"-Knopf in der Mapping-Tabelle fuegt diese drei Zeilen
 * in einem Schritt ein — sofern noch nicht vorhanden.
 */
const ALL_ACCESS_PASS_VARIANTS: AblefyProductMapping[] = [
  { ablefyProductId: "424736", traderiqProductSlug: "all-access", planLabel: "ohne Testzeitraum" },
  { ablefyProductId: "457085", traderiqProductSlug: "all-access", planLabel: "3 Mon. Testzeitraum" },
  { ablefyProductId: "465040", traderiqProductSlug: "all-access", planLabel: "6 Mon. Testzeitraum" },
];

/**
 * Standard-Mappings fuer die vier Einzeldepots. Pro Depot eine Ablefy-
 * Product-ID — die Pricing-Plans fuer Monats-/Jahresabo sind in Ablefy
 * beim selben Product hinterlegt; unsere App muss daher nicht per ID
 * zwischen Mon/Jahr unterscheiden.
 */
const SINGLE_DEPOT_MAPPINGS: AblefyProductMapping[] = [
  { ablefyProductId: "424738", traderiqProductSlug: "starter" },
  { ablefyProductId: "424744", traderiqProductSlug: "trend" },
  { ablefyProductId: "427053", traderiqProductSlug: "stillhalter" },
  { ablefyProductId: "427056", traderiqProductSlug: "cockpit" },
];

/**
 * Mock-Payloads fuer den Test-Webhook-Simulator. Jeder Eintrag schickt einen
 * realistischen POST an unseren eigenen /api/v1/ablefy/webhook-Endpoint —
 * so kann der Empfangs-Pfad (Mapping → LookupHint → Auto-Lookup) ohne echte
 * Ablefy-Verbindung getestet werden.
 *
 * Hinweis: Wenn ein API-Key/-Secret konfiguriert ist, triggert der
 * AutoLookup nach dem Empfang eine echte Ablefy-API-Anfrage mit den
 * unten genannten IDs — die Mock-IDs existieren nicht bei Ablefy, daher
 * wird das Lookup mit "lookup.failed" enden. Fuer den Webhook-Empfang
 * (Signaturpruefung optional + Hint-Extraktion) ist der Test trotzdem
 * gueltig.
 */
const SIMULATED_WEBHOOKS: { value: string; label: string; payload: Record<string, unknown> }[] = [
  {
    value: "abo-aktiv",
    label: "Abo aktiv (ORDER → /api/orders/{id})",
    payload: { event: "Abo aktiv", order_id: 999001, data: { order_id: 999001, product_id: 457085, buyer_email: "demo+abo@example.com" } },
  },
  {
    value: "abo-storniert",
    label: "Abo storniert (ORDER)",
    payload: { event: "Abo storniert", order_id: 999002, data: { order_id: 999002, product_id: 424736, buyer_email: "demo+cancel@example.com" } },
  },
  {
    value: "zahlung-erfolgreich",
    label: "Zahlung erfolgreich (PAYMENT → /api/payments/{id})",
    payload: { event: "Zahlung erfolgreich", payment_id: 5550001, data: { payment_id: 5550001, amount: 97, currency: "EUR" } },
  },
  {
    value: "zahlungsfehler",
    label: "Zahlungsfehler (PAYMENT)",
    payload: { event: "Zahlungsfehler", payment_id: 5550002, data: { payment_id: 5550002, amount: 97, currency: "EUR", error: "card_declined" } },
  },
  {
    value: "erstattung-erfolgreich",
    label: "Erstattung erfolgreich (REFUND → /api/payments/{id})",
    payload: { event: "Erstattung erfolgreich", payment_id: 5550003, data: { payment_id: 5550003, refund_amount: 97 } },
  },
  {
    value: "chargeback-erfolgreich",
    label: "Chargeback erfolgreich (CHARGEBACK → /api/payments/{id})",
    payload: { event: "Chargeback erfolgreich", payment_id: 5550004, data: { payment_id: 5550004, amount: 97 } },
  },
  {
    value: "zugriff-geaendert",
    label: "Zugriff geändert (PAYER → /api/payers/{transfer_ext_id})",
    payload: { event: "Zugriff geändert", transfer_ext_id: "PAYER-DEMO-001", data: { transfer_ext_id: "PAYER-DEMO-001", access_changed: true } },
  },
  {
    value: "saas-plan",
    label: "SaaS-Plan aktualisiert (SAAS_PLAN → /api/products/{id})",
    payload: { event: "SaaS-Plan aktualisiert", product_id: 424736, data: { product_id: 424736 } },
  },
];

interface AblefyEvent {
  id: string;
  ts: string;
  kind: string;
  status: "ok" | "warn" | "error";
  summary: string;
  lookupHint?: AblefyLookupHintRecord;
}

export function AblefyManager() {
  const [cfg, setCfg] = useState<AblefyConfig>(readAblefyConfig());
  const [mounted, setMounted] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState<"url" | "secret" | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; msg: string }>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<null | { ok: boolean; msg: string; aggregate?: unknown }>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<null | { ok: boolean; data?: unknown; msg?: string }>(null);
  const [events, setEvents] = useState<AblefyEvent[]>([]);
  const [saved, setSaved] = useState(false);
  const [autoLookupCount, setAutoLookupCount] = useState(0);
  const [simulatorEvent, setSimulatorEvent] = useState<string>("abo-aktiv");
  const [simulating, setSimulating] = useState(false);
  const [simulatorResult, setSimulatorResult] = useState<null | { ok: boolean; msg: string }>(null);
  // Sync-Filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Refs persistieren ueber Renders hinweg, ohne Re-Render auszuloesen.
  // dispatchedRef = Set aus "endpoint/id" — verhindert doppelte Auto-Lookups
  // waehrend der Server das Lookup-Resultat noch nicht in den Event-Stream
  // geschrieben hat (Race zwischen Polling-Tick und Server-Antwort).
  const dispatchedRef = useRef<Set<string>>(new Set());
  const cfgRef = useRef<AblefyConfig>(cfg);
  cfgRef.current = cfg;

  useEffect(() => {
    setMounted(true);
    // Sofortiger Fallback aus localStorage, damit das UI nicht flackert.
    setCfg(readAblefyConfig());
    setWebhookUrl(getAblefyWebhookUrl());
    fetchEvents();
    // Async: lade die echte Konfig aus Supabase und ueberschreibe lokal.
    void loadConfigFromServer();
    const id = setInterval(fetchEvents, 8000);
    return () => clearInterval(id);
  }, []);

  async function loadConfigFromServer() {
    try {
      const res = await fetch("/api/v1/ablefy/config");
      const json = await res.json();
      if (!json.ok || !json.config) return;
      // Nur uebernehmen, wenn die DB-Werte tatsaechlich was enthalten —
      // sonst wuerden wir beim ersten Laden (DB-Singleton mit Default-
      // Werten) den moeglicherweise gefuellten localStorage ueberschreiben.
      const c = json.config as AblefyConfig;
      const dbHasContent = Boolean(
        c.apiKey || c.apiSecret || c.webhookSecret || (c.productMapping && c.productMapping.length > 0),
      );
      if (!dbHasContent) return;
      setCfg(c);
      writeAblefyConfig(c);
    } catch {
      // Server-Fehler / Supabase nicht konfiguriert → wir bleiben beim localStorage.
    }
  }

  function update<K extends keyof AblefyConfig>(key: K, value: AblefyConfig[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function persist() {
    // Erst zur DB schreiben, dann localStorage mirrorn. So bleibt die App
    // funktionsfaehig auch wenn der Browser den localStorage clearet.
    try {
      const res = await fetch("/api/v1/ablefy/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const json = await res.json();
      if (!json.ok) {
        // DB konnte nicht schreiben — wir warnen, aber speichern lokal als Fallback.
        console.warn("[AblefyManager] DB-Save fehlgeschlagen:", json.error);
      }
    } catch (err) {
      console.warn("[AblefyManager] DB-Save Netzwerkfehler:", err);
    }
    writeAblefyConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function generateWebhookSecret() {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
    update("webhookSecret", hex);
  }

  function copy(value: string, what: "url" | "secret") {
    navigator.clipboard?.writeText(value);
    setCopied(what);
    setTimeout(() => setCopied(null), 1400);
  }

  async function fetchEvents() {
    try {
      const res = await fetch("/api/v1/ablefy/events?limit=30");
      const json = await res.json();
      if (json.ok) {
        setEvents(json.events);
        dispatchPendingLookups(json.events as AblefyEvent[]);
      }
    } catch {}
  }

  /**
   * Auto-Trigger: Sucht nach `webhook.received`-Events mit `lookupHint`,
   * fuer die noch kein passender `lookup.success`/`lookup.failed` existiert,
   * und ruft `/api/v1/ablefy/lookup` mit den lokalen Credentials auf.
   *
   * Idempotent: pro `endpoint/id`-Schluessel feuern wir hoechstens einen
   * Lookup gleichzeitig (dispatchedRef). Nach 30 Sek wird der Schluessel
   * freigegeben — falls der Server-Roundtrip kein Resultat in den Stream
   * geschrieben hat, kann beim naechsten Tick erneut versucht werden.
   */
  function dispatchPendingLookups(eventList: AblefyEvent[]) {
    const c = cfgRef.current;
    if (!c.enabled || !c.apiKey || !c.apiSecret) return;

    for (const ev of eventList) {
      if (ev.kind !== "webhook.received" || !ev.lookupHint) continue;
      const hint = ev.lookupHint;
      const key = `${hint.endpoint}/${hint.id}`;

      if (dispatchedRef.current.has(key)) continue;

      // Schon ein lookup.* in der Liste, das *nach* dem Webhook kam und auf
      // /api/{endpoint}/{id} zielt? Dann nichts tun.
      const webhookTs = new Date(ev.ts).getTime();
      const alreadyResolved = eventList.some((e) => {
        if (e.kind !== "lookup.success" && e.kind !== "lookup.failed") return false;
        if (new Date(e.ts).getTime() < webhookTs) return false;
        return e.summary.includes(`/api/${key}`);
      });
      if (alreadyResolved) continue;

      dispatchedRef.current.add(key);
      setAutoLookupCount((n) => n + 1);
      void fetch("/api/v1/ablefy/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: c.apiKey,
          apiSecret: c.apiSecret,
          endpoint: hint.endpoint,
          id: hint.id,
        }),
      })
        .catch(() => {})
        .finally(() => {
          // Schluessel nach kurzem Delay freigeben, damit der naechste
          // Polling-Tick das eingetragene lookup.*-Event sehen kann.
          setTimeout(() => dispatchedRef.current.delete(key), 30000);
        });
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/v1/ablefy/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cfg.apiKey, apiSecret: cfg.apiSecret }),
      });
      const json = await res.json();
      if (json.ok) {
        setTestResult({ ok: true, msg: "Verbindung OK · Authentifizierung erfolgreich (/api/me)" });
        const next = { ...cfg, lastTestAt: new Date().toISOString() };
        setCfg(next);
        writeAblefyConfig(next);
      } else {
        setTestResult({ ok: false, msg: `Fehler: ${json.error ?? "unbekannt"} (HTTP ${json.status ?? "?"})` });
      }
    } catch (err) {
      setTestResult({ ok: false, msg: err instanceof Error ? err.message : "Verbindung fehlgeschlagen" });
    } finally {
      setTesting(false);
      fetchEvents();
    }
  }

  async function runSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/v1/ablefy/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          apiSecret: cfg.apiSecret,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        const a = json.aggregate as { invoicesFetched: number; totalRevenue: number };
        setSyncResult({
          ok: true,
          msg: `Sync OK · ${a.invoicesFetched} Rechnungen · ${a.totalRevenue.toFixed(2)} €`,
          aggregate: json.aggregate,
        });
        const next = { ...cfg, lastSyncAt: new Date().toISOString() };
        setCfg(next);
        writeAblefyConfig(next);
      } else {
        setSyncResult({ ok: false, msg: `Sync-Fehler: ${json.error ?? "unbekannt"}` });
      }
    } catch (err) {
      setSyncResult({ ok: false, msg: err instanceof Error ? err.message : "Sync fehlgeschlagen" });
    } finally {
      setSyncing(false);
      fetchEvents();
    }
  }

  async function runPreview() {
    setPreviewing(true);
    setPreviewResult(null);
    try {
      const res = await fetch("/api/v1/ablefy/sync/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cfg.apiKey, apiSecret: cfg.apiSecret }),
      });
      const json = await res.json();
      if (json.ok) {
        setPreviewResult({ ok: true, data: json.sample });
      } else {
        setPreviewResult({ ok: false, msg: json.error ?? "Fehler" });
      }
    } catch (err) {
      setPreviewResult({ ok: false, msg: err instanceof Error ? err.message : "Fehler" });
    } finally {
      setPreviewing(false);
    }
  }

  function addProductMapping() {
    const next: AblefyProductMapping = { ablefyProductId: "", traderiqProductSlug: "starter" };
    update("productMapping", [...cfg.productMapping, next]);
  }

  function addAllAccessVariants() {
    const existingIds = new Set(cfg.productMapping.map((m) => m.ablefyProductId));
    const toAdd = ALL_ACCESS_PASS_VARIANTS.filter((v) => !existingIds.has(v.ablefyProductId));
    if (toAdd.length === 0) return;
    update("productMapping", [...cfg.productMapping, ...toAdd]);
  }

  function addSingleDepots() {
    const existingIds = new Set(cfg.productMapping.map((m) => m.ablefyProductId));
    const toAdd = SINGLE_DEPOT_MAPPINGS.filter((v) => !existingIds.has(v.ablefyProductId));
    if (toAdd.length === 0) return;
    update("productMapping", [...cfg.productMapping, ...toAdd]);
  }

  async function simulateWebhook() {
    const sim = SIMULATED_WEBHOOKS.find((s) => s.value === simulatorEvent);
    if (!sim) return;
    setSimulating(true);
    setSimulatorResult(null);
    try {
      const res = await fetch("/api/v1/ablefy/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sim.payload),
      });
      const json = await res.json();
      if (json.ok) {
        const hint = json.lookupHint ? ` → /api/${json.lookupHint.endpoint}/${json.lookupHint.id}` : " (kein Mapping erkannt)";
        setSimulatorResult({ ok: true, msg: `Test-Webhook gesendet${hint}` });
      } else {
        setSimulatorResult({ ok: false, msg: `Test fehlgeschlagen: ${json.error ?? "unbekannt"}` });
      }
    } catch (err) {
      setSimulatorResult({ ok: false, msg: err instanceof Error ? err.message : "Fehler beim Senden" });
    } finally {
      setSimulating(false);
      fetchEvents();
    }
  }
  function updateProductMapping(i: number, patch: Partial<AblefyProductMapping>) {
    const next = cfg.productMapping.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    update("productMapping", next);
  }
  function removeProductMapping(i: number) {
    update("productMapping", cfg.productMapping.filter((_, idx) => idx !== i));
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Status-Karte */}
      <div className="card-base p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-md ${cfg.enabled ? "bg-profit/15 text-profit" : "bg-muted text-muted-foreground"}`}>
              <Plug className={cfg.enabled ? "h-5 w-5" : "h-5 w-5"} />
            </div>
            <div>
              <div className="text-sm font-semibold">Ablefy-Integration</div>
              <div className="text-xs text-muted-foreground">
                {cfg.enabled ? "Aktiv" : "Inaktiv"}
                {cfg.lastTestAt && (
                  <>
                    <span className="mx-2">·</span>
                    Zuletzt getestet: {new Date(cfg.lastTestAt).toLocaleString("de-DE")}
                  </>
                )}
                {cfg.lastSyncAt && (
                  <>
                    <span className="mx-2">·</span>
                    Letzter Sync: {new Date(cfg.lastSyncAt).toLocaleString("de-DE")}
                  </>
                )}
              </div>
            </div>
          </div>
          <Toggle
            label={cfg.enabled ? "Aktiviert" : "Deaktiviert"}
            enabled={cfg.enabled}
            onChange={(v) => update("enabled", v)}
          />
        </div>
      </div>

      {/* API-Credentials */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <Key className="h-4 w-4 text-brand" /> API-Credentials
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          API-Key und API-Secret aus Ablefy: <strong>Anbieter-Account → Einstellungen → API</strong>. Werden als Query-Parameter (<code>key</code>, <code>secret</code>) bei jedem Request mitgegeben.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="API-Key" required>
            <input
              type="text"
              className="input-base font-mono text-[11px]"
              placeholder="z.B. live_pk_..."
              value={cfg.apiKey}
              onChange={(e) => update("apiKey", e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Field label="API-Secret" required>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                className="input-base pr-9 font-mono text-[11px]"
                placeholder="••••••••••"
                value={cfg.apiSecret}
                onChange={(e) => update("apiSecret", e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={showSecret ? "Verbergen" : "Anzeigen"}
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={testConnection} disabled={testing || !cfg.apiKey || !cfg.apiSecret} className="btn-secondary inline-flex items-center gap-2">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Verbindung testen (/api/me)
          </button>
          {testResult && (
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ${testResult.ok ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
              {testResult.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {testResult.msg}
            </span>
          )}
          <a href="https://api.myablefy.com/api/swagger_doc/" target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1 text-xs">
            Ablefy-API-Doku <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Webhook-Setup */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <Webhook className="h-4 w-4 text-brand" /> Webhook-Empfang
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Trag in Ablefy → <strong>Marketing → Webhooks → Neuer Webhook</strong> die folgende URL ein, aktiviere „JSON" und „Wiederholen bis zu erfolgreicher Antwort", waehle die gewuenschten Events aus.
        </p>

        <Field label="Webhook-URL (in Ablefy eintragen)">
          <div className="relative">
            <input
              readOnly
              className="input-base pr-10 font-mono text-[11px]"
              value={webhookUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={() => copy(webhookUrl, "url")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="URL kopieren"
            >
              {copied === "url" ? <Check className="h-3.5 w-3.5 text-profit" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </Field>

        <Field label="Webhook-Signing-Secret (HMAC-SHA256)">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showWebhookSecret ? "text" : "password"}
                className="input-base pr-9 font-mono text-[11px]"
                placeholder="Generiere ein zufaelliges Secret (mind. 32 Hex-Zeichen)"
                value={cfg.webhookSecret}
                onChange={(e) => update("webhookSecret", e.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={showWebhookSecret ? "Verbergen" : "Anzeigen"}
              >
                {showWebhookSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <button onClick={generateWebhookSecret} className="btn-secondary inline-flex items-center gap-1 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Generieren
            </button>
            {cfg.webhookSecret && (
              <button onClick={() => copy(cfg.webhookSecret, "secret")} className="btn-ghost inline-flex items-center gap-1 text-xs">
                {copied === "secret" ? <Check className="h-3.5 w-3.5 text-profit" /> : <Copy className="h-3.5 w-3.5" />}
                Kopieren
              </button>
            )}
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Hinterleg dasselbe Secret in Ablefy (falls vom Webhook-Setup unterstuetzt) bzw. lass es leer fuer ungesicherte Webhooks im Test. Empfehlung: NIEMALS produktiv ohne Secret.
          </span>
        </Field>

        {/* Test-Webhook-Simulator — funktioniert auch ohne echte Ablefy-Verbindung */}
        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-3">
          <div className="mb-2 text-xs font-semibold">Test-Webhook simulieren</div>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Sendet einen lokalen POST an <code className="font-mono">/api/v1/ablefy/webhook</code> mit einem realistischen Mock-Payload. Im Live-Event-Log unten siehst du das Ergebnis. Ideal um die Pipeline (Empfang → LookupHint → Auto-Lookup) zu testen, ohne dass Ablefy live einen Brief schicken muss.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input-base text-xs"
              value={simulatorEvent}
              onChange={(e) => setSimulatorEvent(e.target.value)}
              disabled={simulating}
            >
              {SIMULATED_WEBHOOKS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button onClick={simulateWebhook} disabled={simulating} className="btn-secondary inline-flex items-center gap-1 text-xs">
              {simulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Senden
            </button>
            {simulatorResult && (
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ${simulatorResult.ok ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                {simulatorResult.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {simulatorResult.msg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Produkt-Mapping */}
      <div className="card-base p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4 text-brand" /> Produkt-Mapping
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={addSingleDepots} className="btn-ghost inline-flex items-center gap-1 text-xs" title="Fuegt die vier Einzeldepots (Starter / Trend / Stillhalter / Cockpit) mit den richtigen Ablefy-IDs ein.">
              <Plus className="h-3.5 w-3.5" /> Einzeldepots einfuegen
            </button>
            <button onClick={addAllAccessVariants} className="btn-ghost inline-flex items-center gap-1 text-xs" title="Fuegt die drei Standard-Varianten des Anlegerclub All Access Pass mit den richtigen Ablefy-IDs ein.">
              <Plus className="h-3.5 w-3.5" /> All Access Pass-Varianten einfuegen
            </button>
            <button onClick={addProductMapping} className="btn-secondary inline-flex items-center gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Mapping hinzufuegen
            </button>
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Welche Ablefy-Produkt-ID gehoert zu welchem TraderIQ-Depot? Wird benoetigt, damit Webhook-Events automatisch das richtige Depot freischalten und KPI-Charts den Product-Mix korrekt zuordnen koennen.
          Plan-Label macht im Backend (User-Detail) sichtbar, welche Variante (z.B. „3 Mon. Testzeitraum") ein Mitglied gekauft hat.
        </p>

        {cfg.productMapping.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Noch keine Mappings. Klick „Mapping hinzufuegen" oben rechts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2">Ablefy-Product-ID</th>
                  <th className="px-3 py-2">TraderIQ-Depot</th>
                  <th className="px-3 py-2">Plan-Label (optional)</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cfg.productMapping.map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <input
                        className="input-base font-mono text-[11px]"
                        placeholder="z.B. 12345"
                        value={m.ablefyProductId}
                        onChange={(e) => updateProductMapping(i, { ablefyProductId: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="input-base"
                        value={m.traderiqProductSlug}
                        onChange={(e) => updateProductMapping(i, { traderiqProductSlug: e.target.value as ProductSlug })}
                      >
                        {PRODUCT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="input-base"
                        placeholder="z.B. Starter Monatlich 89 €"
                        value={m.planLabel ?? ""}
                        onChange={(e) => updateProductMapping(i, { planLabel: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => removeProductMapping(i)} className="btn-ghost text-destructive" aria-label="Mapping entfernen">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manueller Sync */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <RefreshCw className="h-4 w-4 text-brand" /> Manueller Sync (historische Daten)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Zieht historische Rechnungen aus <code>/api/invoices</code> und aggregiert sie zu KPIs (Revenue, Status-Verteilung, Produkt-Mix, Monats-Buckets). Webhooks decken nur neue Events ab — fuer den Zeitraum davor brauchst du diesen Sync.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Datum von">
            <input type="date" className="input-base" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </Field>
          <Field label="Datum bis">
            <input type="date" className="input-base" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button onClick={runSync} disabled={syncing || !cfg.apiKey || !cfg.apiSecret} className="btn-brand inline-flex w-full items-center justify-center gap-2">
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync ausfuehren
            </button>
          </div>
        </div>
        {syncResult && (
          <div className={`mt-3 rounded-md p-3 text-xs ${syncResult.ok ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
            {syncResult.ok ? <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> : <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
            {syncResult.msg}
          </div>
        )}

        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-3">
          <div className="mb-2 text-xs font-semibold">Debug: Rohdaten der ersten 3 Rechnungen zeigen</div>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Falls der Sync 0,00 € zeigt, liegt das meist an Feldnamen, die ich anders annehme. Klick hier, um die echten Felder einer Ablefy-Rechnung zu sehen — den JSON-Output bitte mir schicken, dann fixe ich das Mapping.
          </p>
          <button
            onClick={runPreview}
            disabled={previewing || !cfg.apiKey || !cfg.apiSecret}
            className="btn-secondary inline-flex items-center gap-1 text-xs"
          >
            {previewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Rohdaten zeigen
          </button>
          {previewResult && (
            <div className="mt-3">
              {previewResult.ok ? (
                <pre className="max-h-96 overflow-auto rounded-md border border-border bg-background p-3 text-[10px] leading-tight">
                  {JSON.stringify(previewResult.data, null, 2)}
                </pre>
              ) : (
                <div className="rounded-md bg-loss/10 p-3 text-xs text-loss">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" /> {previewResult.msg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-1 text-xs text-profit">
            <CheckCircle2 className="h-3.5 w-3.5" /> Gespeichert
          </span>
        )}
        <button onClick={persist} className="btn-brand">Konfiguration speichern</button>
      </div>

      {/* Live-Event-Log */}
      <div className="card-base p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-brand" /> Live-Events
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{events.length}</span>
            {cfg.enabled && cfg.apiKey && cfg.apiSecret && (
              <span className="inline-flex items-center gap-1 rounded-full bg-profit/10 px-1.5 py-0.5 text-[10px] text-profit" title="Webhook-Events werden automatisch durch /api/v1/ablefy/lookup mit Detail-Daten angereichert.">
                <RefreshCw className="h-2.5 w-2.5" /> Auto-Lookup aktiv
                {autoLookupCount > 0 && <span className="font-mono">· {autoLookupCount}</span>}
              </span>
            )}
          </h3>
          <button onClick={fetchEvents} className="btn-ghost inline-flex items-center gap-1 text-xs">
            <RefreshCw className="h-3 w-3" /> Aktualisieren
          </button>
        </div>
        {events.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Noch keine Events. Trigger einen Test oder Sync, oder schick einen Webhook aus Ablefy.
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2 rounded-md border border-border bg-muted/10 px-2 py-1.5 text-[11px]">
                <span className={`inline-flex h-4 items-center rounded-md px-1.5 text-[9px] font-semibold ${
                  ev.status === "ok" ? "bg-profit/15 text-profit" :
                  ev.status === "warn" ? "bg-amber-500/15 text-amber-700" :
                  "bg-loss/15 text-loss"
                }`}>
                  {ev.status.toUpperCase()}
                </span>
                <span className="font-mono text-muted-foreground">{new Date(ev.ts).toLocaleTimeString("de-DE")}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium text-foreground/80">{ev.kind}</span>
                <span className="text-muted-foreground">·</span>
                <span className="flex-1 text-muted-foreground">{ev.summary}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-xs">
      <span className="mb-1 block font-semibold">
        {label}
        {required && <span className="text-loss"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-label={label}
      aria-pressed={enabled}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
        enabled ? "border-profit bg-profit/10 text-profit" : "border-border bg-muted/30 text-muted-foreground"
      }`}
    >
      <span className={`relative inline-flex h-4 w-7 rounded-full border ${enabled ? "border-profit bg-profit" : "border-border bg-muted"}`}>
        <span className={`absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white transition-transform ${enabled ? "translate-x-3" : "translate-x-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

function Plug({ className }: { className?: string }) {
  // Brand Plug-Icon-Stand-In (lucide hat Plug, aber wir brauchen kein extra import)
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v6" />
      <path d="M15 2v6" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0V8z" />
      <path d="M12 17v4" />
    </svg>
  );
}
