# 🌅 Guten Morgen — Anleitung in 5 Schritten

Diese Datei lesen wenn du nach der heutigen Nachtschicht (Iter 48 + 49) das **erste Mal** in die App schaust und sehen willst, ob alles funktioniert.

> **Stand: Iter 49 deployed.** Ablefy-Bestandsdaten-Import + Auto-Customer-Anlage bei Webhook ist scharfgeschaltet.

---

## ✅ Was während der Nacht gebaut wurde

| Iter | Was |
|---|---|
| **48** | Tabellen `customers` + `customer_subscriptions` in Supabase. Sync-Endpoint schreibt Ablefy-Kunden in die DB. `/admin/users` zeigt echte Ablefy-Kunden + Filter + Einladen-Knopf. |
| **49** | Bei jedem neuen Webhook (Kauf / Storno / Refund) wird der Customer + Subscription **automatisch** in der DB angelegt oder aktualisiert. |

---

## Schritt 1 — SQL-Skript in Supabase einspielen (1 Min)

1. Geh zu deinem Supabase-Dashboard → **SQL Editor** → **New query**
2. Öffne diese Datei: [`docs/supabase-migration-iter48.sql`](supabase-migration-iter48.sql)
3. Komplettes Skript reinkopieren
4. **„Run"** klicken
5. Du solltest **„Success. No rows returned"** sehen

→ **Was passiert:** Zwei neue Tabellen werden angelegt: `customers` und `customer_subscriptions`. Beide bleiben erstmal leer.

---

## Schritt 2 — Tabellen verifizieren (30 Sek)

In Supabase → **Table Editor** sollten jetzt **4 Tabellen** in der Liste stehen:

- `ablefy_config` (aus Iter 43)
- `comments` (aus Iter 43)
- **`customers` (NEU)** ← Bestätige dass die da ist
- **`customer_subscriptions` (NEU)** ← Bestätige dass die da ist

→ Wenn alle 4 da sind: weiter zu Schritt 3.

---

## Schritt 3 — Bestandsdaten aus Ablefy ziehen (1–2 Min)

1. Geh in unserer App auf:
   ```
   https://anlegerclub-app-web.vercel.app/admin/integrations/ablefy
   ```
2. Scroll runter zum Kasten **„Manueller Sync (historische Daten)"**
3. Datum von: **leer lassen** (oder weit zurück, z.B. 01.01.2024)
4. Datum bis: **leer lassen** (oder heute)
5. Klick **„Sync ausfuehren"**

→ **Was passiert:** Die App ruft Ablefys `/api/invoices` ab (alle deine echten Bestellungen), schreibt sie in zwei Tabellen:
- `customers`: Pro E-Mail-Adresse einen Eintrag (kein Doppel)
- `customer_subscriptions`: Pro Bestellung einen Eintrag

→ **Erwartung:** Nach 30–60 Sek siehst du eine grüne Erfolgsmeldung wie:
```
Sync OK · 2.847 Invoices · Revenue 178.420,15 € · 1.234 Kunden · 1.890 Subs
```

(Zahlen sind illustrativ — deine echten kommen je nach Bestand.)

---

## Schritt 4 — Kunden in der App ansehen (30 Sek)

1. Geh auf:
   ```
   https://anlegerclub-app-web.vercel.app/admin/users
   ```
2. Du siehst **2 Sektionen** in der Tabelle:
   - **Mock-User** (Andrei, Max, Babsi, Hendrik) — login-fähig
   - **Ablefy-Kunden** (alle Bestandskunden aus Schritt 3) — markiert mit **„Ablefy"-Badge**, noch **NICHT login-fähig**

3. **Filter ausprobieren:**
   - **„Aktiv"** → nur active/paid
   - **„Storniert"** → nur cancelled
   - **„Erstattet"** → nur refunded
   - **„Beendet"** → expired

4. **Einladen-Knopf** rechts neben einem Ablefy-Kunden → öffnet dein Mailprogramm mit fertiger Einladungs-Mail (du verschickst sie selber, bis das Mailtool angebunden ist).

---

## Schritt 5 — Test-Webhook simulieren (1 Min)

Damit du siehst, dass die **Auto-Customer-Anlage** über Webhook funktioniert:

1. Geh zurück zu `/admin/integrations/ablefy`
2. Im Kasten „Webhook-Empfang" → unten der **„Test-Webhook simulieren"**-Block
3. Wähl **„Abo aktiv (ORDER → /api/orders/{id})"**
4. Klick **„Senden"**

→ **Was passiert:** Ein Mock-Webhook wird losgeschickt. Die App:
- Nimmt ihn an (Live-Event-Log unten zeigt den Eintrag)
- Macht den Auto-Lookup (kann fehlschlagen, weil Mock-IDs nicht real sind — egal)
- Schreibt einen Test-Customer mit der Mail `demo+abo@example.com` in die DB

5. Geh wieder zu `/admin/users` → Refresh → der Test-Kunde sollte als „Ablefy"-Eintrag in der Liste stehen.

---

## 🟢 Wenn alles geklappt hat

Du siehst:
- Ablefy-Bestandsdaten in der Mitglieder-Liste
- Filter funktionieren
- Einladen-Knopf öffnet dein Mailprogramm
- Test-Webhook landet als neuer Customer in der DB

→ **Sprint A** (Login-Flow + Passwort-Vergabe + SMS-Bestätigung) ist der nächste große Brocken. Damit können sich diese Ablefy-Kunden dann auch wirklich einloggen.

## ❌ Wenn was nicht klappt

- **„Sync OK · 0 Kunden · 0 Subs"** → wahrscheinlich fehlt das **Produkt-Mapping**. Geh zum Mapping-Kasten, klick **„Einzeldepots einfuegen"** + **„All Access Pass-Varianten einfuegen"**, **„Konfiguration speichern"** — dann Sync nochmal.
- **„HTTP 401" / „missing_credentials"** → API-Key/-Secret in `/admin/integrations/ablefy` einmal speichern (in DB persistieren)
- **„Sync OK · X Invoices · 0,00 €"** → vermutlich liefern Ablefys Invoices die Beträge in einem anderen Feld. Sag mir Bescheid, ich fixe das Feld-Mapping.

## Was als nächstes ansteht

- **Sprint A:** Login-Flow gegen DB + Passwort-Vergabe + SMS (du + dein Kollege + ich, ~2 Tage)
- **Profilbild-Cloud-Upload** (Supabase Storage)
- **Trial-End-Tracking** ist NICHT geplant (du willst keine Reminder)
- **Welcome-Mail aus unserer App** ist NICHT geplant (kommt aus Ablefy)

---

Schreib mir wenn du ans Werk gehst — ich helfe sofort wenn was hakt. ☀️
