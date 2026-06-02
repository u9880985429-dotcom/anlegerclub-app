/**
 * Phase-1-Eventbus fuer Ablefy-Webhook-/Sync-Daten.
 *
 * Module-level Cache: bleibt waehrend der Lifetime einer Serverless-Instanz
 * erhalten, geht aber bei Cold-Start verloren. Fuer Produktion in Phase 2
 * durch Postgres + LISTEN/NOTIFY ersetzen.
 */

export type AblefyEventKind =
  | "webhook.received"
  | "webhook.rejected"
  | "webhook.insecure"
  | "sync.started"
  | "sync.completed"
  | "sync.failed"
  | "test.connection"
  | "lookup.success"
  | "lookup.failed";

export interface AblefyLookupHintRecord {
  endpoint: "orders" | "payments" | "payers" | "products";
  id: string;
  /** Erkannter Event-Group (ORDER/PAYMENT/...) — null wenn unbekannt. */
  group: string | null;
  /** Aus welchem Payload-Feld die ID gezogen wurde (zum Debuggen). */
  idSource: string | null;
}

export interface AblefyEvent {
  id: string;
  ts: string;
  kind: AblefyEventKind;
  status: "ok" | "warn" | "error";
  summary: string;
  payload?: unknown;
  /** Wenn das Event ein dispatchbarer Webhook ist: Hint fuer den Detail-Lookup. */
  lookupHint?: AblefyLookupHintRecord;
}

const MAX_EVENTS = 200;
const events: AblefyEvent[] = [];

export function appendAblefyEvent(e: Omit<AblefyEvent, "id" | "ts">): AblefyEvent {
  const ev: AblefyEvent = {
    id: `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    ...e,
  };
  events.unshift(ev);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  return ev;
}

export function listAblefyEvents(limit = 50): AblefyEvent[] {
  return events.slice(0, limit);
}
