# Ablefy Webhook → API-Endpoint Mapping

**Datei:** `ablefy-webhook-api-mapping.csv`
**Zeilen:** 67 Events (ORDER · PRODUCT · PAYER · SAAS_PLAN · PRICING_PLAN · PAYMENT · REFUND · CHARGEBACK · LESSON · QUIZ)

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
