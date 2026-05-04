-- ─── Iter 48: customers + customer_subscriptions Tabellen ────────────────
-- Trader IQ Anlegerclub — Phase-2-Schema fuer Bestandskunden aus Ablefy.
--
-- Dieses Skript ist idempotent — du kannst es mehrfach ausfuehren ohne
-- Fehler. CREATE IF NOT EXISTS auf allen Strukturen.
--
-- Anwendung:
--   1. Geh in Supabase → SQL Editor → New query
--   2. Komplettes Skript reinkopieren
--   3. "Run" klicken
--   4. Du solltest "Success. No rows returned" sehen
--
-- Vorhandene Tabellen `comments` und `ablefy_config` (aus Iter 43) werden
-- nicht angefasst.
-- ──────────────────────────────────────────────────────────────────────────

-- 1) customers — die Kunden aus Ablefy
CREATE TABLE IF NOT EXISTS public.customers (
  -- Wir nutzen die Email als natuerlichen Primaerschluessel:
  -- Username = Mailadresse aus Ablefy (Owner-Vorgabe).
  email TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  -- Ablefy-payer_id (transfer_ext_id im Webhook-Payload). Optional, weil
  -- nicht alle Webhooks/Invoices eine Payer-ID liefern.
  ablefy_payer_id TEXT,
  -- Phase-A-Anfangswert: niemand hat Passwort, kein Login moeglich.
  -- Wird im Sprint A (Login-Flow) gesetzt.
  password_hash TEXT,
  -- Bei Sprint A werden wir hier Reset-Tokens, Last-Login, etc. ergaenzen.
  status TEXT NOT NULL DEFAULT 'active',
  -- Phase-2-Erweiterungen (Adresse / Telefon / Newsletter-Optin) folgen.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_ablefy_payer_id ON public.customers(ablefy_payer_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 2) customer_subscriptions — pro Kunde mehrere Subscriptions moeglich
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Foreign Key auf customers.email
  customer_email TEXT NOT NULL REFERENCES public.customers(email) ON DELETE CASCADE,
  -- TraderIQ-Slug (starter / trend / stillhalter / cockpit / all-access)
  product_slug TEXT NOT NULL,
  -- Ablefy-Product-ID (424738, 424736, 457085 etc.) — fuer Plan-Label-Lookup
  ablefy_product_id TEXT,
  -- Plan-Label aus dem Mapping ("ohne Testzeitraum", "3 Mon. Testzeitraum", ...)
  plan_label TEXT,
  -- Ablefy-Order-ID — eindeutig pro Kauf
  ablefy_order_id TEXT,
  -- Status: active / paid / paused / cancelled / expired / refunded
  status TEXT NOT NULL DEFAULT 'active',
  -- Beziffert in Cent (Integer), damit keine Floating-Point-Probleme
  amount_cents INTEGER,
  currency TEXT DEFAULT 'EUR',
  started_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique-Constraint auf ablefy_order_id (wenn nicht null)
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_subs_ablefy_order_id
  ON public.customer_subscriptions(ablefy_order_id)
  WHERE ablefy_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_subs_email ON public.customer_subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_subs_product ON public.customer_subscriptions(product_slug);
CREATE INDEX IF NOT EXISTS idx_customer_subs_status ON public.customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customer_subs_ablefy_product_id ON public.customer_subscriptions(ablefy_product_id);

ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
