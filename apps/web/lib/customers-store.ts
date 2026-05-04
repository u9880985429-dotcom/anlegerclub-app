import { getSupabaseAdmin } from "./supabase";

/**
 * Persistente Customer-CRUD via Supabase. Faellt auf null/[] zurueck,
 * wenn Supabase nicht konfiguriert ist (lokale Entwicklung).
 *
 * Phase-2-Anfang: Datenmodell fuer echte Ablefy-Kunden, getrennt vom
 * bestehenden Mock-User-System (`packages/api/src/mock/users.ts`).
 * Sobald Sprint A (Login + Auth) fertig ist, ersetzen die Customers
 * die Mock-Daten komplett. Bis dahin laufen beide parallel:
 *   - Mock-Users (Andrei/Max/Babsi/Hendrik) → Login-faehig
 *   - Customers in Supabase → im Admin sichtbar, NOCH NICHT login-faehig
 */

export type CustomerStatus = "active" | "blocked" | "deleted";
export type SubscriptionStatus =
  | "active"
  | "paid"
  | "paused"
  | "cancelled"
  | "expired"
  | "refunded";

export interface Customer {
  email: string;
  firstName: string | null;
  lastName: string | null;
  ablefyPayerId: string | null;
  status: CustomerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSubscription {
  id: string;
  customerEmail: string;
  productSlug: string;
  ablefyProductId: string | null;
  planLabel: string | null;
  ablefyOrderId: string | null;
  status: SubscriptionStatus;
  amountCents: number | null;
  currency: string;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface UpsertCustomerInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  ablefyPayerId?: string | null;
  status?: CustomerStatus;
  notes?: string | null;
}

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
    console.error("[customers-store] upsertCustomer:", error?.message);
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
    console.error("[customers-store] listCustomers:", error.message);
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

export interface UpsertSubscriptionInput {
  customerEmail: string;
  productSlug: string;
  ablefyProductId?: string | null;
  planLabel?: string | null;
  ablefyOrderId?: string | null;
  status?: SubscriptionStatus;
  amountCents?: number | null;
  currency?: string;
  startedAt?: string | null;
  currentPeriodEnd?: string | null;
}

export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<CustomerSubscription | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const normalizedEmail = input.customerEmail.trim().toLowerCase();
  // Wenn ablefyOrderId vorhanden ist, on-conflict auf ablefy_order_id —
  // sonst kann es zu Duplikaten kommen, aber das ist tolerabel im Worst-Case.
  const baseRow = {
    customer_email: normalizedEmail,
    product_slug: input.productSlug,
    ablefy_product_id: input.ablefyProductId ?? null,
    plan_label: input.planLabel ?? null,
    ablefy_order_id: input.ablefyOrderId ?? null,
    status: input.status ?? "active",
    amount_cents: input.amountCents ?? null,
    currency: input.currency ?? "EUR",
    started_at: input.startedAt ?? null,
    current_period_end: input.currentPeriodEnd ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.ablefyOrderId) {
    const { data, error } = await supabase
      .from("customer_subscriptions")
      .upsert(baseRow, { onConflict: "ablefy_order_id", ignoreDuplicates: false })
      .select("*")
      .single();
    if (error || !data) {
      console.error("[customers-store] upsertSubscription (with order):", error?.message);
      return null;
    }
    return rowToSub(data as DbSubRow);
  }
  // Ohne Order-ID: Insert (kein dedup moeglich).
  const { data, error } = await supabase
    .from("customer_subscriptions")
    .insert(baseRow)
    .select("*")
    .single();
  if (error || !data) {
    console.error("[customers-store] insertSubscription:", error?.message);
    return null;
  }
  return rowToSub(data as DbSubRow);
}

export async function listSubsByCustomerEmails(emails: string[]): Promise<CustomerSubscription[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase || emails.length === 0) return [];
  const normalized = emails.map((e) => e.trim().toLowerCase());
  const { data, error } = await supabase
    .from("customer_subscriptions")
    .select("*")
    .in("customer_email", normalized);
  if (error) {
    console.error("[customers-store] listSubsByCustomerEmails:", error.message);
    return [];
  }
  return ((data ?? []) as DbSubRow[]).map(rowToSub);
}

export async function listAllCustomerSubscriptions(): Promise<CustomerSubscription[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("customer_subscriptions")
    .select("*");
  if (error) {
    console.error("[customers-store] listAllCustomerSubscriptions:", error.message);
    return [];
  }
  return ((data ?? []) as DbSubRow[]).map(rowToSub);
}
