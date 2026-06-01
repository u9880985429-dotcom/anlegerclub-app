# 🧪 Funktionstest — Durchklick aller Bereiche (Live im Browser)

> Methode: Dev-Server (`pnpm --filter web dev`) lokal gestartet, als **OWNER**
> (andrei@traderiq.net) eingeloggt, jeden Bereich im Browser aufgerufen, dabei
> HTTP-Status, Server-Render-Fehler, Browser-Konsole und das Rendern geprüft.
> Lokal ist **keine Supabase/DB** verbunden → datenabhängige Stellen liefern
> bewusst leere Werte bzw. `503` (eingebauter Fallback), das ist KEIN Fehler.

## Ergebnis-Übersicht

| Bereich | Route | Status | Anmerkung |
|---|---|---|---|
| Login | `/login` | ✅ | Formular + Demo-Logins + Passwort-Reset-Link |
| Dashboard | `/dashboard` | ✅ | rendert, keine Konsolenfehler |
| Einstellungen | `/settings` | ✅ | 200 |
| Benachrichtigungen | `/notifications` | ✅ | 200 |
| **Admin-Übersicht** | `/admin` | ✅ | Stat-Kacheln, Zahlungsproblem-Liste, Quick-Actions |
| Mitglieder | `/admin/users` | ✅ | Mock-Mitglieder, keine Konsolenfehler |
| Subscriptions/Einladungen | `/admin/subscriptions` | ✅ | 200 |
| Community-Moderation | `/admin/community` | ✅ | 200 |
| Audit-Log | `/admin/audit` | ✅ | 200 |
| Datenlogs | `/admin/logs` | ✅ | 200 |
| **KPI-Dashboard** | `/admin/kpi` | ✅ | 12 Widgets, 56 SVG-Charts, Filterbar, Bearbeiten/Hinzufügen/Standard — alles rendert |
| KPI sonstige Daten | `/admin/kpi/sonstige-daten` | ✅ | 200 |
| **Integrationen/Ablefy** | `/admin/integrations/ablefy` | ✅ | alle Knöpfe (Diagnose, Sync, Mapping, Speichern …); Daten-Fetches 503 nur lokal (keine DB) |
| Integrationen-Übersicht | `/admin/integrations` | ✅ | 200 |
| E-Mail-Konfiguration | `/admin/email-config` | ✅ | 200 |
| Domains & SSL | `/admin/domains` | ✅ | 200 |
| Schriftarten | `/admin/fonts` | ✅ | 200 |
| Cookies & Einwilligungen | `/admin/cookies` | ✅ | 200 |
| **AGB** | `/admin/legal/agb` | ✅ *(repariert)* | war kaputt (RSC-Fehler) → behoben, Editor lädt |
| **Impressum** | `/admin/legal/impressum` | ✅ *(repariert)* | dito |
| **Datenschutz** | `/admin/legal/datenschutz` | ✅ *(repariert)* | dito |
| Depots | `/depot/{starter,trend,stillhalter,cockpit}` | ✅ | rendern, Charts da, keine Konsolenfehler |
| Handover | `/handover` | ✅ | 200 |
| Info | `/info` | ✅ | 200 |

## 🔧 Dabei gefundene + behobene Fehler

1. **Rechtstexte-Seiten kaputt** (`/admin/legal/*`) — Server-Component griff auf
   `LEGAL_DOCS[slug].title` zu, das in einer **Client**-Komponente lag → RSC-Fehler
   „Cannot access agb.title on the server". **Fix:** Metadaten in server-sichere
   `legal-docs.ts` ausgelagert. Live verifiziert: Seiten laden wieder.
2. **Middleware-Härtung** — das zentrale Sicherheits-Gate konnte in der **Cloud
   (HTTPS)** das Login-Cookie evtl. nicht lesen und so den Admin-Bereich +
   Daten-Abrufe blockieren (wahrscheinliche Ursache „Admin-Paneel geht nicht").
   **Fix:** liest das Cookie jetzt in beiden Varianten, sichert nur Admin-Seiten,
   sperrt nie fälschlich aus.
3. **🔴 Admin-Backend stürzte ab — NUR in Produktion** (vom Inhaber gemeldet):
   Der Link „Admin-Backend" führt auf `/admin/kpi`. Die dort eingebauten
   **Chart.js**-Diagramme (Canvas) wurden server-seitig mitgerendert → im
   **Produktions-Build** „Application error: a client-side exception", im
   Dev-Modus unsichtbar (daher zunächst nicht reproduziert). **Fix:** Chart.js-
   Widgets via `next/dynamic` mit `ssr:false` einbinden → laden ausschließlich
   im Browser, kein Server-Rendering der Canvas. **In einem echten Produktions-
   Build (`next build` + `next start`) verifiziert:** Login → Klick „Admin-Backend"
   → KPI-Dashboard lädt mit beiden Charts, KEIN Crash, keine Konsolenfehler.
4. **Robustheit (ultrareview)** — Abo-Speicher konvergiert jetzt bei echter
   Parallelität (Unique-Violation wird abgefangen statt verschluckt); doppeltes
   Konfig-Laden im Webhook entfernt.

## ➕ Chart.js ins Admin eingebaut

- Zwei neue Diagramme (`Umsatz-Verlauf (Chart.js)`, `Produkt-Mix (Chart.js)`)
  sind jetzt **fester Teil des KPI-Standard-Dashboards** (direkt neben den
  SVG-Versionen). **Prod-sicher** geladen (`next/dynamic`, `ssr:false`).
  In Dev UND im Produktions-Build verifiziert: beide rendern als Canvas, keine Fehler.

## Hinweise für die Produktion (nicht lokal testbar)

- Mit verbundener Supabase liefern die `503`-Stellen echte Daten.
- Falls ein bestehendes Mitglied sein KPI-Dashboard schon angepasst hat, erscheinen
  die zwei neuen Chart.js-Widgets nicht automatisch — über „Widget hinzufügen"
  ergänzbar (oder „Standard").
