# Architektur-Review Anlegerclub

## 0. Stand & wie es weitergeht (zuletzt: Mai 2026)

**ERLEDIGT — Stufe 1 + Stufe 2 + medium-risk Bugfixes (committet & gepusht in PR #1).**
Verifiziert: Typecheck 7/7 + Produktions-Build gruen (Middleware aktiv).

Umgesetzt:
- **Sicherheit:** Auth-Guards auf 6 Ablefy-Routen + diagnose-PII-Leck geschlossen;
  NEU `apps/web/middleware.ts` als zentrales Gate (Ablefy-API nur OWNER/ADMIN,
  Webhook oeffentlich, /admin nur Mitarbeiter-Rollen).
- **Datenintegritaet:** `upsertSubscription` robust umgebaut (select-then-update/insert,
  unabhaengig vom DB-Index; Kaufdatum bleibt bei Storno erhalten); Webhook-Sub nur
  bei erfolgreichem Customer.
- **Korrektheit:** Sync-Umsatz nur aus bezahlten Rechnungen; Status-Vorrang
  (refunded/cancelled gewinnen); Order-Schluessel einheitlich = nur order_id;
  KPI-/Admin-Zaehlungen korrigiert; MRR aus letztem vollen Monat (ARR = MRR*12);
  NaN-Chart-Guard.
- **Tempo:** Sync sammelt + schreibt gebuendelt (kein Timeout durch ~40k
  Einzel-Writes); `.in()`-Abfragen in Choerten (kein HTTP 414); `maxDuration=300`.
- **Build/Baseline:** `@types/node` in db+api → Monorepo typecheckt 7/7.

**NOCH OFFEN (vom Inhaber bewusst zurueckgestellt / braucht Entscheidung):**
- **Webhook-Secret** ist in Ablefy (noch) NICHT gesetzt → die Sperre fuer
  unsignierte Webhooks ist daher NICHT scharf. Stattdessen warnt der Webhook jetzt
  sichtbar im Event-Log (`webhook.insecure`). **TODO Inhaber:** Secret in Ablefy
  setzen, dann hier auf "ablehnen" umstellen (`webhook/route.ts`, else-Zweig).
- **Perf (groesser, nicht angefasst):** `EarningsBrowser` virtualisieren;
  `listCustomers` paginieren; KPI-Widget-Re-Renders memoizen.
- **Architektur Stufe 3-7** (Repository-Layer, customers/ablefy/comments/kpi-Module,
  Datenmodell vereinheitlichen) — siehe Abschnitt 4. Groessere, gestaffelte Arbeit.
- Kleinkram: `DynamicGridLoader` Produktfilter auf Totals; Sync-Pagination-Heuristik
  (`<50`); notify-Routen vor Phase-2-Aktivierung absichern; CANCELLED-Bucket KPI.

---

## 1. In einfachen Worten (fuer den Inhaber)

Stell dir deine App wie ein Haus vor, das gerade gebaut wird. Das gute Nachricht zuerst: Das Fundament ist solider als bei vielen Projekten in dieser Phase. Es gibt schon erkennbare "Raeume" (Kunden, Zahlungen, Kommentare, Auswertungen), und an einigen Stellen sind die Waende sauber gezogen. Es ist also **kein** Spaghetti-Chaos, in dem nichts mehr zu retten waere.

Aber: Ein paar Raeume sind noch ohne Tueren miteinander verbunden, und manche Arbeit, die in den Keller (die Datenbank) gehoert, wird mitten im Wohnzimmer erledigt. Das laesst sich heute noch leicht aufraeumen — je laenger man wartet, desto mehr verwaechst es. Die groesste Sorge ist nicht die Ordnung, sondern **drei ernste Sicherheits- und Datenfehler**: Eine technische Info-Seite gibt Kundendaten an jeden eingeloggten Nutzer heraus (auch an spaetere zahlende Kunden), die Verbindung zu deinem Zahlungsanbieter (Ablefy) hat an mehreren Stellen kein Schloss an der Tuer, und — am wichtigsten — ein Datenbank-Fehler sorgt dafuer, dass **Abos aktuell gar nicht gespeichert werden** (die Kunden landen in der DB, aber ihre Abos nicht).

Mein Rat: Erst die handvoll kritischer Fehler abdichten (das geht schnell und sicher), danach in kleinen, ungefaehrlichen Schritten die Raeume sauber trennen. Kein grosser Umbau auf einen Schlag — sondern Stockwerk fuer Stockwerk, sodass die App jederzeit weiter funktioniert.

## 2. Ist-Zustand der Architektur

Die App ist ein Monolith (ein Next.js-Projekt + drei geteilte Pakete `api`, `db`, `ui`). Sie ist in Phase 1: vieles laeuft noch ueber Mock-Daten (Demo-Daten im Code), echte Daten kommen nach und nach aus Supabase dazu. Genau dieser **Mock-vs-Echt-Mix** ist das durchgehende Muster der heutigen Probleme.

| Subsystem | Groesstes Problem | Schwere |
|---|---|---|
| **Ablefy (Zahlungen/Webhooks)** | "God-Routes": 300+-Zeilen-Handler erledigen Sicherheitspruefung, Daten-Mapping, DB-Schreiben und Kunden-Anlage in einem. Vier Routen kopieren denselben Ablefy-HTTP-Client. Schreibt direkt in fremdes Kunden-Modul. | hoch |
| **Kunden & Abos** | Zwei konkurrierende Datenmodelle parallel (Mock-`User` vs. echte `Customer`). Die Zugriffsregel "hat Zugang?" ist 3x kopiert. Rollen-Aenderungen leben nur im Browser. | hoch |
| **Kommentare & Community** | Zwei "Wahrheiten" fuer dasselbe: persistierter POST-Pfad vs. rein lokale UI-Logik (Bearbeiten/Loeschen/Verstecken tun nichts). Mock+DB werden auf Seiten-Ebene zusammengemischt. | hoch |
| **KPI & Dashboards** | Geschaeftslogik (Filter, Umsatz-Rechnung) steckt in UI-Komponenten. Riesendateien (1418 + 999 Zeilen) mit echten und erfundenen Zahlen nebeneinander, fuer den Nutzer nicht unterscheidbar. | mittel |
| **Auth, Rollen & Zugriff** | Kein zentrales Sicherheits-Gate (`middleware.ts` fehlt komplett — bestaetigt). Inline-Rollenchecks statt vorhandener Helfer. API-Keys im Klartext im Browser-Cookie. | hoch |
| **Datenzugriff & Mock-Split** | Das Kunden-Datenmodell existiert **dreifach** (Prisma-Schema, handkopiertes SQL, TS-Typen) und ist nicht abgeglichen. Kein einheitlicher Repository-Layer. | hoch |
| **Benachrichtigungen** | Drei Teile (Versand, Vorlagen, Lesen), die gar nicht zusammengeschaltet sind. Vorlagen sind toter Code. Versand-Routen ohne Schloss. | mittel |
| **Trades & Depots** | Read-heavy und vergleichsweise sauber, aber kein Service-Layer; 3-4 fast identische Depot-Seiten kopiert; Schreibpfad ist Attrappe. | mittel |

**Ehrliche Einordnung:** Die Subsysteme sind inhaltlich bereits gut erkennbar — das ist die halbe Miete fuer eine spaetere Modul-Trennung. Die Kopplung entsteht fast ueberall an denselben zwei Stellen: (1) Daten werden direkt statt ueber eine gekapselte Schnittstelle gelesen/geschrieben, und (2) Mock- und Echt-Daten werden in den Seiten zusammengeruehrt. Beides ist gut reparierbar.

## 3. Ziel: Modularer Monolith (microservice-ready)

**Die Idee:** Wir bleiben bei *einem* Haus (einem Projekt) — das ist in dieser Phase billiger und schneller als viele kleine Huetten (Microservices). Aber wir ziehen *saubere Innenwaende mit klar definierten Tueren* (eine "public API" pro Modul). Niemand klettert mehr durchs Fenster ins Nachbarzimmer; man geht durch die Tuer. Der Vorteil: Sobald ein Raum zu gross/wichtig wird (z.B. die Zahlungsabwicklung), kann man genau diesen Raum spaeter als eigene Huette (Microservice) ausgliedern — *ohne den Rest des Hauses umzubauen*, weil die Tuer schon definiert ist.

| Modul | Zustaendigkeit | Public API (Tuer) | Spaeter eigener Service? | Aufwand |
|---|---|---|---|---|
| **ablefy** | Zahlungs-Webhooks empfangen, Ablefy-API abfragen, Kauf-Events erzeugen | `handleWebhook`, `createAblefyApiClient`, `syncInvoices`, `getAblefyConfig` | **Ja** (Webhook-/Sync-Worker) | hoch |
| **customers** | Kunden + Abos verwalten, *eine* Zugriffsregel, Status-Mapping | `getCustomer`, `upsertSubscription`, `hasActiveAccess`, `recordAblefyLifecycle` | **Ja** (customer-service) | mittel |
| **comments** | Kommentar-CRUD + Moderation + Wortfilter | `listComments`, `createComment`, `setCommentVisibility`, `applyContentPolicy` | **Ja** | mittel |
| **kpi** | Kennzahlen berechnen, filtern, Layout speichern | `computeKpiSnapshot`, `applyKpiFilters`, `loadKpiLayout` | **Ja** (read-model) | mittel-hoch |
| **trades** | Trade-Signale lesen/schreiben, Depots | `listSignals`, `getSignalById`, `getPortfolio` | **Ja** (read-heavy) | mittel |
| **notifications** | Mail/Push versenden, Vorlagen, Inbox | `sendEmailNotification`, `renderTemplate`, `listNotifications` | **Ja** | niedrig-mittel |
| **access** | Login, Rollen, Produkt-Zugriff, API-Keys | `requireSession`, `requireRole`, `can`, `validateApiKey` | **Nein** (bleibt App-Bibliothek) | mittel |
| **@traderiq/data** | Gemeinsamer Datenzugriff (Repositories) hinter Schnittstellen | `CustomerRepository`, `CommentRepository`, `AblefyConfigRepository` | **Nein** (Shared-Kernel) | mittel |
| **@traderiq/domain** | Reine Typen + Enums + Zod-Schemas (ohne Mock-Daten) | Typen-Export | **Nein** (geteilt) | niedrig |

**Ziel-Ordnerstruktur (Baum):**

```
apps/web/
  modules/
    ablefy/
      service.ts        # Geschaeftslogik (Webhook, Sync, API-Client)
      repository.ts     # einziger DB-Zugriff fuer dieses Modul
      types.ts
      index.ts          # public API — NUR das darf von aussen importiert werden
    customers/
      service.ts        # recordAblefyLifecycle, hasActiveAccess (1 Status-Mapping)
      repository.ts
      types.ts
      index.ts
    comments/
      service.ts        # createComment, setCommentVisibility, applyContentPolicy
      repository.ts
      types.ts
      index.ts
    kpi/
      service.ts        # computeKpiSnapshot, applyKpiFilters, resolveDateRange
      repository.ts     # loadKpiLayout/saveKpiLayout (Prisma gekapselt)
      widgets/          # React-Widgets bleiben hier (duenne Konsumenten)
      index.ts
    trades/
      service.ts
      repository.ts
      index.ts
    notifications/
      providers/        # EmailProvider, PushProvider hinter Interface
      templates/        # EINE Vorlagen-Quelle
      service.ts
      index.ts
    access/
      session.ts        # einzige Stelle mit getServerSession
      permissions.ts    # aus @traderiq/api hierher gezogen
      api-keys.ts
      index.ts
  app/
    api/...             # Route-Handler werden duenn: parse -> modul.service() -> response
    (app)/...           # Seiten konsumieren nur Modul-APIs, kein Mock+DB-Merge mehr
  middleware.ts         # NEU: oberstes Sicherheits-Gate (fehlt heute komplett)

packages/
  domain/               # reine Typen/Enums/Zod (ohne Mock-Daten)
  data/                 # Repository-Layer (Supabase/Prisma gekapselt)
  ui/
```

Der Kerngedanke: **Route-Handler und Seiten werden duenn.** Sie nehmen eine Anfrage entgegen, rufen *eine* Modul-Funktion auf und geben das Ergebnis zurueck. Die ganze Logik (heute in den 300-Zeilen-Handlern) wandert hinter die Tueren.

## 4. Migrationsplan in Stufen

Kein Big-Bang. Jede Stufe ist fuer sich auslieferbar, die App funktioniert nach jeder Stufe.

- **Stufe 1 — Kritische Fehler abdichten (Sicherheit + Datenbank).** Was: die handvoll Auth-Luecken (diagnose/events/pending-buyers/sync/test/lookup/preview), den Webhook-ohne-Secret und den Abo-Speicher-Fehler (partieller Index) beheben. Warum: Das sind echte, heute aktive Risiken (Datenleck + Abos werden nicht gespeichert). Aufwand: niedrig — kleine, lokale Aenderungen, kein Umbau.
- **Stufe 2 — `middleware.ts` als oberstes Gate einziehen.** Was: ein zentrales Sicherheits-Gate, das `/api/v1/ablefy/*` und Admin-Bereiche absichert (der oeffentliche Webhook bleibt per HMAC geschuetzt). Warum: heute existiert *kein* zentrales Gate; jede Route entscheidet selbst (inkonsistent). Aufwand: niedrig-mittel.
- **Stufe 3 — Repository-Layer einfuehren (`@traderiq/data`).** Was: alle direkten `supabase.from(...)`- und `prisma.*`-Aufrufe hinter Repository-Funktionen ziehen. Warum: macht Daten austauschbar und testbar; Voraussetzung fuer alles Weitere. Aufwand: mittel. Risiko gering, weil rein technisch (Verhalten bleibt gleich).
- **Stufe 4 — `customers`-Modul mit *einer* Status-/Zugriffslogik.** Was: die dreifach kopierte Zugriffsregel und die zwei abweichenden Status-Mappings (Webhook vs. Sync) in je eine Funktion zusammenfuehren. Warum: beendet das Auseinanderdriften und die Mock/Echt-Spaltung. Aufwand: mittel.
- **Stufe 5 — `ablefy`-Modul: einen API-Client, Routen duenn machen.** Was: die vier kopierten HTTP-Clients zu einem `createAblefyApiClient` zusammenfuehren; Webhook/Sync emittieren nur noch ein Kauf-Event, das `customers` konsumiert. Warum: entkoppelt Zahlungen von Kunden; macht Ablefy spaeter als Service ausgliederbar. Aufwand: hoch.
- **Stufe 6 — `comments` + `kpi` Service-Layer.** Was: Logik aus den Seiten/Handlern in Services; Mock+DB-Merge durch *eine* `listComments()`/`computeKpiSnapshot()` ersetzen; Riesendateien aufteilen. Warum: beseitigt die "zwei Wahrheiten" und die unklare Mock/Echt-Anzeige. Aufwand: mittel-hoch.
- **Stufe 7 — Datenmodell vereinheitlichen.** Was: das dreifach gepflegte Kunden-Schema (Prisma / SQL / TS) auf *eine* Quelle reduzieren, Row-Typen generieren statt handpflegen. Warum: verhindert kuenftige Drift-Fehler. Aufwand: mittel.

## 5. Gefundene Fehler (verifiziert, priorisiert)

Alle Eintraege wurden gegen den echten Code gegengeprueft (Severity = korrigierte, realistische Einstufung).

| Severity | Datei:Zeile | Problem | Fix | Risiko |
|---|---|---|---|---|
| **critical** | `apps/web/lib/customers-store.ts:214` | `upsert(onConflict:"ablefy_order_id")` zielt auf einen *partiellen* Unique-Index → Postgres-Fehler 42P10. **Abos werden nie gespeichert** (Kunden ja, Abos nein), Webhook meldet trotzdem 200. | Partiellen Index durch vollen `UNIQUE`-Constraint ersetzen (NULLs kollidieren in PG nicht). | mittel |
| **critical** | `apps/web/app/api/v1/ablefy/diagnose/route.ts:15-137` | Route berechnet `allowed`, **erzwingt es aber nie**. Gibt komplette Kunden-Row (E-Mail/Name) + Supabase-Config an jeden eingeloggten Nutzer (inkl. spaetere Kunden). | `if (!allowed) return 403;` ergaenzen; `sample_first_customer` entfernen/maskieren. | niedrig |
| **high** | `apps/web/app/api/v1/ablefy/webhook/route.ts:55-75` | HMAC-Pruefung steckt in `if (webhookSecret)`. Leeres Secret ist der **Default** → jeder unsignierte POST wird akzeptiert, kann Fake-Kunden/Abos schreiben. | Bei fehlendem Secret mit 401/503 ablehnen, nie ungeprueft durchlassen. | mittel |
| **high** | `apps/web/app/api/v1/ablefy/webhook/route.ts:126` | Subscription-Upsert laeuft auch wenn Customer-Upsert `null` zurueckgab → FK-Verletzung, Lifecycle-Event verloren (200 trotzdem). | Sub-Upsert nur bei vorhandenem Customer; gleiche Guard in `sync/route.ts:257`. | niedrig |
| **high** | `apps/web/app/api/v1/ablefy/webhook/route.ts:140` | `startedAt: new Date()` wird bei *jedem* Event geschrieben → spaeterer Storno ueberschreibt echtes Kaufdatum; `amount` wird auf null gesetzt. | `started_at`/`amount` nur im Create-Pfad setzen (vorher per select pruefen). | niedrig |
| **high** | `apps/web/app/api/v1/ablefy/sync/route.ts:211` | `totalRevenue += amount` *vor* der State-Pruefung → unbezahlte/stornierte/erstattete Rechnungen zaehlen als Umsatz. Trifft auch `byProduct`/`byMonth`. | Umsatz nur bei `state==='paid'` addieren; Refunds separat. | mittel |
| **high** | `apps/web/app/(app)/admin/kpi/page.tsx:25` | Member-Counts ohne `filterKpiRelevantSubs` → interne/Team-Subs zaehlen mit; Churn-Nenner verfaelscht. | `filterKpiRelevantSubs(...)` vor dem Zaehlen anwenden (wie in PricingOverviewCard). | niedrig |
| **high** | `apps/web/app/api/v1/ablefy/events/route.ts:12-16` | Kein Auth → rohe Webhook-Payloads (Kunden-PII) fuer jeden anonymen Aufrufer abrufbar. | `requireSession` + `canManageIntegrations` ergaenzen. | niedrig |
| **high** | `apps/web/app/api/v1/ablefy/pending-buyers/route.ts:13-16` | Kein Auth → Kaeufer-E-Mails/Namen/Order-IDs oeffentlich (DSGVO-relevant). | Gleicher Auth-Guard. | niedrig |
| **high** | `apps/web/app/api/v1/ablefy/sync/route.ts:48-66` | Kein Auth → jeder kann DB-Schreiben triggern (Service-Role, umgeht RLS). | `requireSession` + `canManageIntegrations`; Credentials serverseitig. | niedrig |
| **medium** | `apps/web/app/api/v1/ablefy/lookup/route.ts:31-89` (+test/preview) | Kein Auth → offener Proxy/Credential-Test gegen Ablefy. | Auth-Guard auf alle drei Routen. | niedrig |
| **medium** | `apps/web/app/(app)/admin/page.tsx:7` | "Aktive Mitglieder" zaehlt nur `ACTIVE`, ignoriert `PAID` → zeigt 0 statt korrektem Wert (Widerspruch zur Detailseite). | Filter auf `ACTIVE || PAID` angleichen, gemeinsame Konstante. | niedrig |
| **medium** | `apps/web/app/api/v1/ablefy/webhook/route.ts:137` | Webhook (`order_id ?? payment_id`) vs. Sync (`order_id ?? invoice_id`) → Duplikate/verfehlte Refund-Updates. | Gemeinsame Schluesselableitung, nie `payment_id`/`invoice_id` als Fallback. | mittel |
| **medium** | `apps/web/app/api/v1/ablefy/sync/route.ts:325-332` | Unbekannte/`unpaid` States → Default `active`; Re-Sync setzt `cancelled`/`refunded` faelschlich zurueck. | Status-Prioritaet (refunded/cancelled gewinnen); schwaecheren Status nicht ueberschreiben. | mittel |
| **medium** | `apps/web/app/(app)/admin/kpi/widgets/MetricCards.tsx:46` | MRR = `totalRevenue/12` auf ~30-Tage-Umsatz; ARR (`:53`) nimmt Zeitraum-Umsatz direkt → beide grob falsch. | MRR/ARR aus echtem Monatswert ableiten (letzter voller Monat × 12). | mittel |
| **medium** | `apps/web/app/(app)/admin/kpi/DynamicGridLoader.tsx:95` | Produktfilter wirkt nicht auf Umsatz-/Count-Totals (byMonth ist produkt-agnostisch). | `useMonthForTotals` nur ohne aktiven Produktfilter; byMonth pro Produkt. | mittel |
| **medium** | `apps/web/app/api/v1/ablefy/sync/route.ts:256-279` | `customersUpserted` zaehlt Upsert-Operationen statt eindeutiger Kunden → ueberhoehte Zahl im Log. | Set fuer gesehene E-Mails; oder umbenennen. | niedrig |
| **medium** | `apps/web/app/api/v1/ablefy/sync/route.ts:131-140` | Pagination bricht bei `< 50` ab (geratene Seitengroesse) → verschluckt still Daten, wenn Seite kleiner. | Seitengroesse aus erster Antwort ableiten. | mittel |
| **medium** | `apps/web/app/(app)/admin/kpi/widgets/DataCharts.tsx:81,160,646` + `MetricCards.tsx:197` | `i/(series.length-1)` → NaN-SVG bei genau 1 Monat (Preset `last_month`). Charts rendern leer. | `Math.max(series.length-1, 1)` (wie in Schwester-Komponenten). | niedrig |
| **medium** | `apps/web/lib/ablefy-pending-buyers.ts:51` | Dedup-Fenster nur 60s + In-Memory → Retries >60s/andere Instanz erzeugen Duplikate (nur Anzeige). | Fenster groesser oder persistenter Dedup-Key. | niedrig |
| **low** | `apps/web/app/(app)/admin/kpi/page.tsx:27` | `CANCELLED` faellt aus allen drei Buckets → in Donut-Summe unsichtbar (latent, mit Echt-Daten). | Gemeinsame `TERMINATED`-Konstante; CANCELLED zuordnen. | niedrig |
| **low** | `apps/web/lib/api-validation.ts:24-44` | API-Keys im Klartext-Cookie, plain-equality (Demo). Liefert aktuell nur Mock-Daten. | Phase 2: gehashte Keys in DB + `timingSafeEqual`. | mittel |
| **low** | `apps/web/app/api/notify/email-out/route.ts` + `push-out` | Kein Auth + kein try/catch um externen fetch (heute Stub, keine Aufrufer). | Vor Phase-2-Aktivierung: Auth + try/catch (502). | niedrig |
| **low** | `apps/web/app/(app)/admin/integrations/ablefy/AblefyManager.tsx:156` | Polling ohne In-Flight-Guard → seltene Out-of-Order-Writes (append-only, harmlos). | Sequenz-Token/AbortController im Cleanup. | niedrig |

## 6. Performance (verifiziert, priorisiert)

| Impact | Datei:Zeile | Problem | Fix | Risiko |
|---|---|---|---|---|
| **high** | `apps/web/app/api/v1/ablefy/sync/route.ts:132-139` | Bis zu ~20.000–40.000 *sequentielle* DB-Roundtrips (2 awaits pro Rechnung). Full-Sync laeuft zuverlaessig in Serverless-Timeout (Doku erwartet selbst 30-60s). | Pro Seite *batchen* (1 Customer- + 1 Sub-Upsert pro 50 Rechnungen); E-Mails dedupen; ggf. `maxDuration` setzen. | mittel |
| **high** | `apps/web/components/EarningsBrowser.tsx:44-47` | ~150 Aktien-Karten mit grossen SVG-Charts ohne Virtualisierung → ~30.000 DOM-Knoten beim Oeffnen, Ruckler bei jedem Tastendruck. | Liste virtualisieren/paginieren; Charts in `React.memo`; stddev in `useMemo`. | mittel |
| **medium** | `apps/web/lib/customers-store.ts:148-165` | `listCustomers()` ohne Limit + force-dynamic → laedt bei jedem Admin-Aufruf alle Kunden, rendert ungeblaettert. Skaliert linear schlecht. | Default-Limit + serverseitige Pagination + Suche per `.ilike`. | mittel |
| **medium** | `apps/web/lib/customers-store.ts:236-249` | `.in()` mit potenziell hunderten/tausenden E-Mails → riesiger Query-String, evtl. HTTP 414 (Subs verschwinden still). | Chunking (~200) oder eingebettetes `select('*, customer_subscriptions(*)')`. | niedrig |
| **medium** | `apps/web/app/api/v1/ablefy/sync/route.ts:247-263` | Derselbe Kunde wird pro Rechnung neu ge-upsertet (12 Rechnungen = 12 identische Writes). | Set gesehener E-Mails; Customer nur beim ersten Auftreten upserten. | niedrig |
| **low** | `apps/web/app/(app)/admin/kpi/widgets/registry.tsx:3-23` | Alle ~55 Widget-Dateien statisch importiert → grosser Route-Chunk (aber kein Chart-Lib, nur interne Admin-Seite; Gallery braucht alle ohnehin). | Optional `next/dynamic` fuer schwere Charts. | mittel |
| **low** | `apps/web/lib/customers-store.ts:251-262` | `listAllCustomerSubscriptions()` = `select(*)` ohne Limit — aber **toter Code** (kein Aufrufer). | Entfernen oder durch Aggregat-Query ersetzen. | niedrig |
| **low** | `apps/web/app/api/v1/ablefy/diagnose/route.ts:54-135` | 3 unabhaengige Supabase-Checks seriell (seltene Admin-Route). | `Promise.allSettled` parallelisieren. | niedrig |
| **low** | `apps/web/app/(app)/admin/kpi/DynamicGrid.tsx:176-223` | Widgets ohne Memoization → alle rendern bei Filteraenderung neu (winzige Arrays, ~11 Default-Widgets). | `React.memo` + feldgenaues `useMemo`. | mittel |

**Hinweis:** Mehrere als "high" gemeldete Perf-Punkte (Widget-Bundle, Galerie-Render, KPI-Re-Renders) wurden bei Pruefung auf **low** korrigiert — es gibt keine schwere Chart-Bibliothek (alle Charts sind handgemachtes SVG), und die Datenmengen sind klein. Der einzige echte high-Hebel ist der Ablefy-Full-Sync (Timeout) und die EarningsBrowser-Liste.

## 7. Quick-Wins (jetzt sofort sicher machbar)

Diese Fixes sind risikoarm (`risk: low`) und koennen einzeln eingespielt werden, ohne etwas umzubauen:

1. **Diagnose-Route absichern** — eine Zeile `if (!allowed) return 403;` schliesst ein PII-Leck (kritisch, aber trivial).
2. **Auth-Guard auf events / pending-buyers** — gleicher Einzeiler-Guard, schliesst zwei DSGVO-relevante Lecks.
3. **Admin-"Aktive Mitglieder" auf `ACTIVE || PAID`** — behebt die "0 statt 4"-Anzeige.
4. **KPI-Page: `filterKpiRelevantSubs` anwenden** — interne Accounts raus aus den Zahlen.
5. **NaN-SVG-Guard** (`Math.max(series.length-1, 1)`) an 4 Stellen — leere Charts beim Monats-Filter.
6. **Webhook: Customer-Upsert-Ergebnis pruefen**, Sub nur bei Erfolg schreiben — verhindert verlorene Events.
7. **`startedAt`/`amount` nur im Create-Pfad** — schuetzt echtes Kaufdatum vor Storno-Ueberschreiben.
8. **Toten Code entfernen** (`listAllCustomerSubscriptions`) — eine Skalierungsfalle weniger.

Etwas mehr Sorgfalt (aber hoher Wert), daher nicht "sofort blind":
- **Partieller Index → voller UNIQUE-Constraint** (kritisch — Abos werden sonst nie gespeichert). Braucht eine DB-Migration, daher kurz testen, aber unbedingt ganz oben auf der Liste.
- **Webhook-ohne-Secret ablehnen** und **sync/test/lookup/preview absichern** — Sicherheits-must, minimal mehr Aufwand wegen Credential-Fluss.