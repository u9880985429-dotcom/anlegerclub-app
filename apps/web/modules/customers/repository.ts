import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  Customer,
  CustomerStatus,
  CustomerSubscription,
  SubscriptionStatus,
  UpsertCustomerInput,
  UpsertSubscriptionInput,
} from "./types";

/**
 * customers-REPOSITORY — der EINZIGE Ort mit Supabase-Zugriff fuer Kunden +
 * Abos ("der Schalter"). Faellt auf null/[] zurueck, wenn Supabase nicht
 * konfiguriert ist (lokale Entwicklung).
 *
 * Wichtig: andere Module/Seiten importieren NICHT diese Datei direkt, sondern
 * die oeffentliche Tuer `@/modules/customers` (index.ts).
 */

interface DbCustomerRow {
  email: string;
  first_name: string | null;
  last_name: string | null;
  ablefy_payer_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DbSubRow {
  id: string;
  customer_email: string;
  product_slug: string;
  ablefy_product_id: string | null;
  plan_label: string | null;
  ablefy_order_id: string | null;
  status: string;
  amount_cents: number | null;
  currency: string | null;
  started_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

function rowToCustomer(row: DbCustomerRow): Customer {
  return {
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    ablefyPayerId: row.ablefy_payer_id,
    status: (row.status as CustomerStatus) ?? "active",
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSub(row: DbSubRow): CustomerSubscription {
  return {
    id: row.id,
    customerEmail: row.customer_email,
    productSlug: row.product_slug,
    ablefyProductId: row.ablefy_product_id,
    planLabel: row.plan_label,
    ablefyOrderId: row.ablefy_order_id,
    status: (row.status as SubscriptionStatus) ?? "active",
    amountCents: row.amount_cents,
    currency: row.currency ?? "EUR",
    startedAt: row.started_at,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Customers ────────────────────────────────────────────────────────────

export async function upsertCustomer(input: UpsertCustomerInput): Promise<Customer | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  if (!input.email) return null;
  const normalizedEmail = input.email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      {
        email: normalizedEmail,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        ablefy_payer_id: input.ablefyPayerId ?? null,
        status: input.status ?? "active",
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: false },
    )
    .select("*")
    .single();
  if (error || !data) {
    console.error("[customers-repo] upsertCustomer:", error?.message);
    return null;
  }
  return rowToCustomer(data as DbCustomerRow);
}

export async function listCustomers(options: {
  status?: "active" | "blocked" | "all";
  limit?: number;
} = {}): Promise<Customer[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  let q = supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (options.status && options.status !== "all") {
    q = q.eq("status", options.status);
  }
  if (options.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) {
    console.error("[customers-repo] listCustomers:", error.message);
    return [];
  }
  return ((data ?? []) as DbCustomerRow[]).map(rowToCustomer);
}

export async function countCustomers(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

// ─── Subscriptions ────────────────────────────────────────────────────────

export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<CustomerSubscription | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const normalizedEmail = input.customerEmail.trim().toLowerCase();

  // Felder, die bei JEDEM Event aktualisiert werden duerfen (Status, Betrag, ...).
  // `started_at` (= Kaufdatum) und `ablefy_order_id` werden bewusst NICHT hier
  // gefuehrt, damit Folge-Events (Storno/Refund) das Kaufdatum nicht ueberschreiben.
  const mutable = {
    customer_email: normalizedEmail,
    product_slug: input.productSlug,
    ablefy_product_id: input.ablefyProductId ?? null,
    plan_label: input.planLabel ?? null,
    status: input.status ?? "active",
    amount_cents: input.amountCents ?? null,
    currency: input.currency ?? "EUR",
    current_period_end: input.currentPeriodEnd ?? null,
    updated_at: new Date().toISOString(),
  };

  // Mit Order-ID: "erst nachsehen, dann gezielt schreiben". Das ist robust
  // unabhaengig vom DB-Unique-Index (kein ON CONFLICT noetig) UND bewahrt das
  // urspruengliche Kaufdatum bei Folge-Events.
  if (input.ablefyOrderId) {
    const { data: existing } = await supabase
      .from("customer_subscriptions")
      .select("id, started_at")
      .eq("ablefy_order_id", input.ablefyOrderId)
      .maybeSingle();

    if (existing) {
      const existingRow = existing as { id: string; started_at: string | null };
      const patch: Record<string, unknown> = { ...mutable };
      // started_at nur nachtragen, wenn bisher leer und jetzt ein Datum kommt.
      if (!existingRow.started_at && input.startedAt) {
        patch.started_at = input.startedAt;
      }
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .update(patch)
        .eq("id", existingRow.id)
        .select("*")
        .single();
      if (error || !data) {
        console.error("[customers-repo] updateSubscription:", error?.message);
        return null;
      }
      return rowToSub(data as DbSubRow);
    }

    const { data, error } = await supabase
      .from("customer_subscriptions")
      .insert({ ...mutable, ablefy_order_id: input.ablefyOrderId, started_at: input.startedAt ?? null })
      .select("*")
      .single();
    if (error || !data) {
      console.error("[customers-repo] insertSubscription (with order):", error?.message);
      return null;
    }
    return rowToSub(data as DbSubRow);
  }

  // Ohne Order-ID: Insert (kein dedup moeglich).
  const { data, error } = await supabase
    .from("customer_subscriptions")
    .insert({ ...mutable, ablefy_order_id: null, started_at: input.startedAt ?? null })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[customers-repo] insertSubscription:", error?.message);
    return null;
  }
  return rowToSub(data as DbSubRow);
}

export async function listSubsByCustomerEmails(emails: string[]): Promise<CustomerSubscription[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase || emails.length === 0) return [];
  const normalized = emails.map((e) => e.trim().toLowerCase());
  // In Choerten abfragen: ein einziges .in() mit hunderten/tausenden E-Mails
  // erzeugt einen riesigen Query-String (Gefahr HTTP 414) und laesst Subs
  // still verschwinden. 200 pro Abfrage ist sicher.
  const CHUNK = 200;
  const out: CustomerSubscription[] = [];
  for (let i = 0; i < normalized.length; i += CHUNK) {
    const slice = normalized.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("customer_subscriptions")
      .select("*")
      .in("customer_email", slice);
    if (error) {
      console.error("[customers-repo] listSubsByCustomerEmails:", error.message);
      continue;
    }
    for (const row of (data ?? []) as DbSubRow[]) out.push(rowToSub(row));
  }
  return out;
}
