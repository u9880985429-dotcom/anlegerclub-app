# Ablefy Webhook → API-Endpoint Mapping

## Drei Dateien

| Datei | Zeilen | Zweck |
|---|---|---|
| `ablefy-webhook-AUSGEWAEHLT.csv` | 32 | **Deine konkret aktivierten Events** + Endpoint pro Event |
| `ablefy-endpoint-summary.csv` | 4 + 3 Bonus | **Konsolidierung:** alle 32 Events brauchen nur 4 Endpoints |
| `ablefy-webhook-api-mapping.csv` | 67 | Vollreferenz aller verfuegbaren Webhook-Events (auch nicht-aktivierte) |

## Endpoint-Konsolidierung (TL;DR)

Deine 32 aktivierten Events landen auf nur **4 API-Endpoints**:

```
/api/payments/{id}             ← 16 Events (alle Zahlung-/Refund-/Chargeback-bezogen)
/api/orders/{id}               ← 13 Events (Order-Status, Subscription-Lifecycle)
/api/payers/{transfer_ext_id}  ←  2 Events (Customer-Sync)
/api/products/{id}             ←  1 Event  (SaaS-Plan-Update)
```

Plus 3 Bonus-Endpoints (kein Webhook-Trigger):
- `/api/invoices` GET — Bulk-Pull mit Date-Filter (fuer Initial-Sync)
- `/api/me` GET — Verbindungstest
- `/api/payments/{id}/refund` POST — Refund auslösen (optional, riskant)

**Praktisch:** Ich baue den Webhook-Handler so, dass er per `event_type` den richtigen Endpoint wählt + ID aus dem Payload extrahiert + ihn dort abruft.

## Iteration 31 — Implementierungs-Stand

Der oben beschriebene Lookup ist jetzt implementiert. Drei Bausteine:

| Datei | Zweck |
|---|---|
| `apps/web/lib/ablefy-events.ts` | Single-Source-of-Truth fuer die 32 Events (Display-Name + Aliase + Endpoint + ID-Feld-Kandidaten). `buildLookupHint(eventName, payload)` liefert `{ endpoint, id, group }`. |
| `apps/web/app/api/v1/ablefy/webhook/route.ts` | Bei jedem eingehenden Webhook: HMAC-Check → `buildLookupHint` → Event mit `lookupHint` in den Cache. Antwort enthaelt das Hint-Objekt. |
| `apps/web/app/api/v1/ablefy/lookup/route.ts` | POST `{ apiKey, apiSecret, endpoint, id, eventName? }` → ruft `https://api.myablefy.com/api/{endpoint}/{id}?key=...&secret=...` und legt das Ergebnis als `lookup.success`/`lookup.failed`-Event ab. |

**Phase-1-Architektur:** Server kennt das Webhook-Signing-Secret (Cookie-Mirror), aber **nicht** API-Key/-Secret. Die liegen nur im Browser-LocalStorage. Daher der Split: Webhook-Handler reichert das Event nur mit `lookupHint` an, der Browser triggert anhand dieses Hints den Lookup-Endpoint mit seinen Credentials.

**Phase-2-Plan:** API-Key/-Secret in Postgres + AES-256-GCM-Vault → Webhook-Handler kann den Lookup direkt anstossen, abgeleitete KPIs (Active Members, MRR, Refund Rate) landen im Subscription/User-Schreibpfad.

**Browser-Auto-Trigger** (kommt in Iter 32): Die `AblefyManager`-Komponente pollt `/api/v1/ablefy/events`, sucht `webhook.received`-Events mit `lookupHint`, fuer die noch kein zugehoeriges `lookup.success` existiert, und ruft `POST /api/v1/ablefy/lookup` mit den localStorage-Credentials auf.

## Wie du die CSV öffnest

### Excel (Mac/Windows)
1. Doppelklick auf die Datei
2. Falls Spalten alle in einer Zeile: **Daten → Aus Text/CSV** → Trennzeichen `;` (Semikolon) wählen → UTF-8 → Laden

### Google Sheets
1. **Datei → Importieren → Hochladen** → Datei wählen
2. Trennzeichentyp: **Benutzerdefiniert → `;` (Semikolon)**
3. Format: **Format als Tabelle**

### Numbers (macOS)
Doppelklick reicht — Numbers erkennt CSV automatisch.

## Spaltenstruktur

| # | Spalte | Was drin steht |
|---|---|---|
| 1 | Event-Gruppe | ORDER / PRODUCT / PAYER / SAAS_PLAN / PRICING_PLAN / PAYMENT / REFUND / CHARGEBACK / LESSON / QUIZ |
| 2 | Event-Anzeigename (DE) | Wie es in Ablefy in der Webhook-Konfig steht |
| 3 | Beschreibung | Wann der Event ausgelöst wird |
| 4 | Empfohlener API-Endpoint | Welcher GET-Aufruf liefert die Detail-Daten |
| 5 | HTTP-Methode | GET / POST / — |
| 6 | Auth | `key + secret` als Query-Parameter (Ablefy-Standard) |
| 7 | Webhook-Payload-Felder | Welche Felder im Webhook-Body wir erwarten (Annahme — verifiziere mit echtem Payload) |
| 8 | KPI-Verwendung | In welche TraderIQ-KPIs der Event fließt |
| 9 | Empfehlung aktivieren | JA = sollte aktiv sein · OPTIONAL = nur wenn relevant |

## Wichtige Hinweise

### Die Payload-Feldnamen sind **Annahmen**

Die Spalte „Webhook-Payload-Felder" ist eine begründete Vermutung basierend auf der Ablefy-Doku. Sobald der **erste echte Webhook reinkommt**, schau in `/admin/integrations/ablefy → Live-Events` rein und kopier mir den JSON-Body — dann kann ich die Feldnamen exakt korrigieren.

### Auth-Schema

Alle Ablefy-API-Aufrufe brauchen `?key=DEIN_KEY&secret=DEIN_SECRET` als Query-Parameter (kein Header-Auth). Das Webhook-Empfangsschema ist getrennt davon — der Webhook kommt mit eigenem Signing-Secret (HMAC-SHA256), das wir in `/admin/integrations/ablefy` konfigurieren.

### Endpoints ohne Public-API

LESSON- und QUIZ-Events haben in Ablefys **Public-API keine Lookup-Endpoints**. Wir können sie nur direkt aus dem Webhook-Payload verarbeiten (Engagement-KPIs aus dem Payload selbst).

### „Empfehlung aktivieren"-Logik

- **JA** = Direkter KPI-Impact (Revenue, Churn, Refund, Active-Members). Solltest du in Ablefy aktivieren.
- **OPTIONAL** = Nur wenn du den jeweiligen KPI nutzen willst. Spart Webhook-Volumen.

## Top-10 Empfehlung — falls du minimal anfangen willst

Diese 10 Events reichen für die wichtigsten KPIs (MRR, Active Members, Churn, Refund-Rate, Revenue):

1. **PAYMENT.Zahlung erfolgreich** → Revenue + MRR
2. **PAYMENT.Zahlungsfehler** → Tech-Alert
3. **REFUND.Erstattung erfolgreich** → Refund Rate
4. **CHARGEBACK.Chargeback erfolgreich** → Loss KPI
5. **ORDER.Abo aktiv** → Active Members
6. **ORDER.Abo storniert** → Churn-Donut
7. **ORDER.Abo pausiert** → Payment-Issues
8. **ORDER.Einmal-Zahlung abgeschlossen** → Conversion
9. **ORDER.Abo reaktiviert** → Re-Engagement
10. **PAYER.Zugriff geändert** → Subscription-Sync
