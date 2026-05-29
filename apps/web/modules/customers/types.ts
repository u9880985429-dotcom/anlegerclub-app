/**
 * customers-Modul — TYPEN (rein, ohne Datenzugriff).
 *
 * Datenmodell fuer echte Ablefy-Kunden, getrennt vom Mock-User-System
 * (`packages/api/src/mock/users.ts`). Sobald Sprint A (Login + Auth) fertig
 * ist, ersetzen die Customers die Mock-Daten. Bis dahin laufen beide parallel:
 *   - Mock-Users (Andrei/Max/Babsi/Hendrik) → Login-faehig
 *   - Customers in Supabase → im Admin sichtbar, NOCH NICHT login-faehig
 *
 * Diese Datei enthaelt KEINEN Supabase-/DB-Code, damit Typen ueberall
 * importiert werden koennen, ohne den Datenzugriff mitzuziehen.
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

export interface UpsertCustomerInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  ablefyPayerId?: string | null;
  status?: CustomerStatus;
  notes?: string | null;
}

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
