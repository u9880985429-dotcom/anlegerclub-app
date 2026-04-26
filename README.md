# Trader IQ Anlegerclub – Mitglieder-App

> **Iteration 2** · Vollständige Web-App + Mobile-Optimierung. Vercel-deploybar. Phase 2 = echte DB + Ablefy + SMS + Push.
> Single source of truth: `traderiq-app-spec.md` (im Downloads-Ordner).

## 🚀 Schnellstart

```bash
# 1. Dependencies installieren (einmalig)
pnpm install

# 2. Dev-Server starten → http://localhost:3000
pnpm dev
```

> Falls `pnpm` oder `node` nicht im PATH ist, einmalig:
> `export PATH="$HOME/.local/node/bin:$PATH"` (oder dauerhaft in `~/.zshrc`).

## 🔑 Demo-Logins

Passwort für **alle**: `traderiq2026`

| E-Mail | Status | Produkt | Vorname | Was passiert |
|---|---|---|---|---|
| `max@traderiq.net` | **PAID** (Mitarbeiter) | all-access | Max | Vollzugriff, alle Depots, Admin-Backend (STAFF) |
| `paused@traderiq.net` | paused | starter | Lisa | Login OK → Sperr-Screen mit Ablefy-CTA |
| `expired@traderiq.net` | expired | trend | Tom | Login OK → Sperr-Screen mit allen 5 Reaktivierungs-Links |
| `staff@traderiq.net` | **PAID** (Mitarbeiter) | all-access | Admin | Vollzugriff + Admin-Backend |

## 🌐 Routen

| Route | Beschreibung |
|---|---|
| `/` | Marketing-Splash (hell, traderiq.net-Stil) |
| `/info` | Landing-Page mit eingebettetem Vorstellungs-Video + CTAs |
| `/login` | E-Mail + Passwort + 4 Demo-Helper-Buttons |
| `/locked` | Sperr-Screen (3 personalisierte Texte: paused/expired/refunded) |
| `/onboarding/[slug]` | Tutorial-Slider (5 Slides je Depot) |
| `/dashboard` | Übersicht – alle Stats anklickbar, Trade-Cards verlinken zur Detailseite |
| `/depot/starter` | Welcome / Strategie & Performance / Trade Signale Aktiensparplan / DAX-Millionär / Depotauswertungen / Aktie im Fokus / Archiv |
| `/depot/trend` | Welcome / Start / Trade-Signale / Depotauswertungen / Archiv |
| `/depot/stillhalter` | analog Trend |
| `/depot/cockpit` | Welcome / Perspektiven / Tag/Woche/Monat / **Earnings** / Calendar / Lexikon / Archiv |
| `/depot/[slug]/trade/[id]` | Trade-Detail mit Erklärvideo + Diskussions-Community + Likes/Smileys |
| `/community/[slug]` | Channel-Feed mit Posts |
| `/community/[slug]/post/[id]` | Post-Detail + Kommentare |
| `/notifications` | Inbox |
| `/settings` | Profil, Benachrichtigungen, Sicherheit, Abos, Tutorial-Repeat |
| `/admin` | Übersicht (Aktive Mitglieder + Mitglieder mit Zahlungsschwierigkeiten) |
| `/admin/users` | Mitglieder-Liste, klickbar → Detailseite |
| `/admin/users/[id]` | Vollständige Profilansicht + Aktionen-Menü (Sperren/Abmahnen/Bezahlt/Mail) |
| `/admin/subscriptions` | Bestehende + Einladungen versenden (Mail oder Link kopieren) |
| `/admin/community` | Mod-Queue mit Auto-Hide + Auto-Reply („Wird geprüft 48h") |
| `/admin/audit` | Audit-Log |

> **Trade-Signale, Depotauswertungen, Aktie im Fokus, Marktupdates, Lexikon, Videos, Onboarding-Slides und Pitch-Module** werden direkt im jeweiligen Depot über den **Bearbeitungsmodus**-Button gepflegt (sichtbar nur für STAFF/OWNER/ADMIN), nicht mehr im Admin-Backend.

## 🎨 Branding

- **Theme:** Hell (weiß, traderiq.net-Stil) – default
- **Primär:** `#ff741f` (Trader-IQ-Orange)
- **Profit/Loss:** `#10b981` / `#ef4444`
- **Logo:** PNG-Assets in `apps/web/public/logo-{light,dark}.png`
- **Mobile:** Touch-Targets ≥ 44px, Safe-Area-Inset für iPhone-Notch, horizontale Tab-Scroll

## 💪 Mobile/Web-App

Die Web-App funktioniert vollwertig im **mobilen Browser** (iOS Safari, Android Chrome).
- Bottom-Nav für Mobile mit 5 Hauptbereichen
- Top-Sidebar für Desktop ab `lg:` (1024px)
- Alle Tabs horizontal scrollbar bei zu vielen Tabs
- Phase 3: native React-Native/Expo-App mit identischem Backend

## 🔒 Wortfilter & Werbeerkennung (Spec §10)

Implementiert in `packages/api/src/mock/wordfilter.ts`:
- **Beleidigungen (DACH + EN):** werden mit Sternen maskiert (z. B. „Arschloch" → „A*******h"), Beitrag wird gepostet, Mod wird intern informiert.
- **Werbung/externe Links:** Promo-Patterns (URLs, „klick hier", Konkurrenz-Brands) blockieren das Absenden vollständig vor dem Posten.
- **Erlaubte Smileys:** exakt die in der Spec definierte Liste (im Composer per Smiley-Picker).

## 📊 Performance-Daten

Die Performance-Charts nutzen die echten Daten aus deinen Screenshots:
- **Starter Depot:** +43,48 % YTD 2025 (Stand 31.12.2025)
- **Trend Depot:** +14,3 % YTD 2026 vs. S&P 500 −7,33 % = 21,63 % Outperformance (neue Strategie)
- **Stillhalter Depot:** +172,88 % YTD 2025 vs. S&P 500 +13,54 % = 12,77-fache Outperformance

Performance-Reporting verweist im UI auf das **Visual Trading Journal** mit Trader-IQ-Studenten-Vorteilslink (`https://visualtradingjournal.com/traderiq`) und bindet das SharePoint-Excel als Live-iframe ein.

## ⚙️ Brokerempfehlung

Überall wird **WH-Selfinvest** empfohlen:
- Affiliate-Link mit `?whref=tiq` für Konditionen-Tracking
- Iris-Heinen-Calendly als persönliche Ansprechpartnerin für Trader-IQ-Studenten

## 🔌 Phase-2-Vorbereitungen (heute schon angelegt)

- `packages/db/prisma/schema.prisma` — vollständiges Modell
- `packages/api/src/types.ts` — Zod-Schemas an API-Boundaries
- `app/api/notify/email-out/route.ts` — Webhook-Stub (forwarder bei `NOTIFY_EMAIL_WEBHOOK_URL`)
- `app/api/notify/push-out/route.ts` — analog für Push
- Status-Logik in `lib/access.ts` so gekapselt, dass Phase-2-Webhooks nur DB-Status-Felder schreiben — UI ändert sich nicht

## ☁️ Vercel-Deploy (Schritt für Schritt)

### Variante A: GitHub-Import (empfohlen)

1. **Code zu GitHub pushen** (einmalig, läuft über deinen GitHub-Account):
   ```bash
   cd /Users/maxbauer1992icloud.com/ClaudeCode/Anlegerclub
   git push -u origin main
   ```
   Beim ersten Push wirst du nach **Username** + **Personal Access Token** gefragt (nicht Passwort).
   Token erstellen: https://github.com/settings/tokens/new → Scope `repo` reicht.

2. **Vercel** öffnen (du bist eingeloggt) → **„Add New… → Project"**
3. **Repository `anlegerclub-app`** auswählen → **„Import"**
4. Framework wird automatisch erkannt: **Next.js**
5. **Root Directory** auf `apps/web` setzen
6. **Environment Variables**:
   - `NEXTAUTH_SECRET` = mit `openssl rand -base64 32` generieren (zwingend)
   - `NEXTAUTH_URL` = `https://<dein-projekt>.vercel.app` (kann später auf eigene Domain)
7. **Deploy** klicken. Nach 60–90 Sek live.

> **⚠️ Wichtig (Vercel Pro Trial):** Dein Account ist auf „Pro Trial" – läuft nach 7 Tagen automatisch ab und fällt zurück auf den **kostenlosen Hobby-Plan**. Klick NICHT auf „Upgrade to Pro" ($20/Mo) — die Demo läuft komplett auf dem Free-Plan.

### Variante B: CLI-Deploy (ohne GitHub)

```bash
npx vercel --prod
```

## 📦 Phase-2-Roadmap (laut Spec §17)

| Sprint | Inhalt | Geschätzte Kosten |
|---|---|---|
| **Sprint 0+1** ✅ | Repo-Setup, Mock-Daten, Vercel-Deploy, **Iteration 2 inkl. Light/Mobile/Community-pro-Trade/Earnings** | **0 €** |
| Sprint 2 | Postgres + Prisma + echte Auth, Ablefy-Webhooks, SMS-OTP | bis ~30 €/Mo |
| Sprint 3 | Push/Mail-Webhook live, Mux-Video-Pipeline, Outlook-OAuth-Mailversand im Admin | abh. von Volumen |
| Sprint 4 | React-Native-Apps (Expo + EAS) | $99/Jahr Apple, $25 Google einmalig |
| Sprint 5 | Gamma-AI-Pipeline, VTJ-API-Anbindung statt iframe, Excel-Import | abh. von Gamma-Lizenz |
| Sprint 6 | Events-Modul, Self-Service-Account, Snowflake-Reporting, Earnings-Live-API | abh. |

Siehe `BUDGET.md` für das harte 100-€-Limit der Phase 1.

## 📨 Kontakt

Support: `info@traderiq.net`
