/**
 * In-Memory-Cache fuer "Pending Buyers" — Kunden, die ueber einen Ablefy-
 * Webhook gekauft haben, fuer die in unserer App aber noch kein User-
 * Account existiert (Phase 1: Mock-Userliste, kein Schreibpfad in DB).
 *
 * Phase 2: Wird durch Postgres-Tabelle ersetzt; ein Background-Job legt
 * automatisch User + Subscription an, sobald die E-Mail-Adresse vorhanden
 * ist und ein „Abo aktiv"/„Zahlung erfolgreich"-Event empfangen wurde.
 */

export type PendingBuyerStatus = "new" | "linked" | "ignored";

export interface PendingBuyer {
  id: string;
  ts: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  orderId: string | null;
  paymentId: string | null;
  productId: string | null;
  /** Welches Webhook-Event hat den Eintrag erzeugt (z.B. "Abo aktiv"). */
  triggerEvent: string;
  /** Bezahlbetrag aus dem Payload (falls vorhanden), in EUR. */
  amount: number | null;
  status: PendingBuyerStatus;
}

const MAX = 200;
const buyers: PendingBuyer[] = [];

interface AddArgs {
  triggerEvent: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  orderId?: string | null;
  paymentId?: string | null;
  productId?: string | null;
  amount?: number | null;
}

/**
 * Fuegt einen Pending-Buyer-Eintrag hinzu. De-dupliziert anhand der Order-/
 * Payment-ID + Trigger-Event innerhalb der letzten 60 Sekunden, damit
 * Webhook-Retries (Ablefy schickt bei 5xx erneut) keine Duplikate erzeugen.
 */
export function addPendingBuyer(args: AddArgs): PendingBuyer | null {
  if (!args.email && !args.orderId && !args.paymentId) return null; // nichts woraus wir einen Buyer ableiten koennen
  const dedupeKey = `${args.triggerEvent}::${args.orderId ?? ""}::${args.paymentId ?? ""}`;
  const cutoff = Date.now() - 60_000;
  const recent = buyers.find(
    (b) =>
      `${b.triggerEvent}::${b.orderId ?? ""}::${b.paymentId ?? ""}` === dedupeKey &&
      new Date(b.ts).getTime() > cutoff,
  );
  if (recent) return recent;

  const buyer: PendingBuyer = {
    id: `pb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    email: args.email ?? null,
    firstName: args.firstName ?? null,
    lastName: args.lastName ?? null,
    orderId: args.orderId ?? null,
    paymentId: args.paymentId ?? null,
    productId: args.productId ?? null,
    triggerEvent: args.triggerEvent,
    amount: args.amount ?? null,
    status: "new",
  };
  buyers.unshift(buyer);
  if (buyers.length > MAX) buyers.length = MAX;
  return buyer;
}

export function listPendingBuyers(limit = 50): PendingBuyer[] {
  return buyers.slice(0, limit);
}
