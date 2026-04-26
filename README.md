# Trader IQ Anlegerclub – Mitglieder-App

> Phase 1 = Vercel-Demo mit Mock-Daten. Phase 2 = echte DB + Ablefy + SMS + Push.
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

## 🔑 Demo-Logins (Phase 1)

Passwort für **alle**: `traderiq2026`

| E-Mail | Status | Produkt | Vorname | Was passiert |
|---|---|---|---|---|
| `max@traderiq.net` | active | all-access | Max | Vollzugriff, alle Depots, Admin-Backend (STAFF-Rolle) |
| `paused@traderiq.net` | paused | starter | Lisa | Login OK → Sperr-Screen mit Ablefy-CTA |
| `expired@traderiq.net` | expired | trend | Tom | Login OK → Sperr-Screen mit allen 5 Produkt-Reaktivierungs-Links |
| `staff@traderiq.net` | active | all-access + STAFF | Admin | Vollzugriff + Admin-Backend |

## 🏗 Architektur

```
.
├── apps/
│   └── web/                  # Next.js 14 App Router (TS)
│       ├── app/
│       │   ├── (app)/        # Auth-gegated Routen mit AppShell
│       │   │   ├── dashboard/
│       │   │   ├── depot/[starter|trend|stillhalter|cockpit]/
│       │   │   ├── community/[slug]/
│       │   │   ├── notifications/
│       │   │   ├── settings/
│       │   │   └── admin/    # 12 Sub-Pages
│       │   ├── api/
│       │   │   ├── auth/[...nextauth]/   # NextAuth credentials
│       │   │   └── notify/{email,push}-out/  # Webhook stubs
│       │   ├── login/
│       │   ├── locked/        # 3 personalisierte Sperr-Texte (Spec §5)
│       │   ├── onboarding/[slug]/  # 4–5 Slides je Depot (Spec §7)
│       │   └── page.tsx       # Marketing-Splash
│       ├── components/        # AppShell, Tabs, TradeRow, PitchCard, Logo, …
│       ├── lib/
│       │   ├── auth.ts        # NextAuthOptions
│       │   ├── access.ts      # requireSession, requireProductAccess
│       │   ├── format.ts
│       │   └── copy/          # ⭐ Zentrale Texte (Spec §5/§7/§9/§14)
│       └── public/            # logo-dark.png, logo-light.png
├── packages/
│   ├── api/                   # Service-Layer + Mock-Repos (Spec §16)
│   │   └── src/mock/{users,trades,reports,content,community,notifications,pitch}.ts
│   ├── db/                    # Prisma-Schema (Phase 2 ready, NICHT migriert)
│   │   └── prisma/schema.prisma
│   └── ui/                    # Shared cn() helper
├── BUDGET.md                  # Hartes 100-€-Limit für Phase 1
├── turbo.json                 # Turborepo pipeline
├── pnpm-workspace.yaml
└── vercel.json                # Vercel deploy config
```

## 🎨 Branding (Spec §3)

- **Primär:** `#ff741f` (Trader-IQ-Orange)
- **Sekundär:** `#0b0d10` Dark-BG, `#10b981` Profit, `#ef4444` Loss
- **Logo:** PNG-Assets in `apps/web/public/logo-{dark,light}.png`
- **Default:** Dark Mode (Spec §3)

## 🌐 Routen (Spec §13)

| Route | Beschreibung |
|---|---|
| `/` | Marketing-Splash + Login-CTA |
| `/login` | E-Mail + Passwort + 4 Demo-Helper-Buttons |
| `/locked` | Sperr-Screen (paused/expired/refunded) |
| `/onboarding/[slug]` | Tutorial-Slider |
| `/dashboard` | Übersicht + News + Community-Highlights |
| `/depot/starter` | Welcome / Strategie / Depot (mit Pitch-Card!) / DAX-MIL / Aktie im Fokus |
| `/depot/trend` | START / Trade-Signale / Archiv / Depotauswertung |
| `/depot/stillhalter` | analog zu Trend |
| `/depot/cockpit` | Welcome / Perspektiven / Tag/Woche/Monat / Calendar / Lexikon / Archiv |
| `/community/[slug]` | Feed mit Posts, Reactions, Sichtbarkeitstoggle |
| `/community/[slug]/post/[id]` | Post-Detail + Kommentare |
| `/notifications` | Inbox |
| `/settings` | Profil, Benachrichtigungen, Sicherheit, Abos, Tutorial-Repeat |
| `/admin` | Übersicht (nur STAFF/OWNER/ADMIN) |
| `/admin/{users,subscriptions,trades,reports,focus,marketupdates,lexikon,videos,community,onboarding,pitch,notifications,audit}` | CRUD-Skelette |

## 📝 Wo liegen die Texte?

**Alle Texte** (Login-Status, Onboarding, Pitch, Mail-Templates) liegen zentral in **`apps/web/lib/copy/`** und können dort an EINER Stelle bearbeitet werden:

- `copy/login-status.ts` – Aktiv/Pausiert/Beendet (Spec §5)
- `copy/onboarding.ts` – Tutorial-Slides je Depot (Spec §7)
- `copy/notifications.ts` – Mail- & Push-Templates (Spec §9)

Pitch-Inhalt liegt in `packages/api/src/mock/pitch.ts` (Spec §14).

## 🔌 Phase-2-Vorbereitungen (heute schon angelegt)

- `packages/db/prisma/schema.prisma` — vollständiges Modell aus Spec §11.
- `packages/api/src/types.ts` — Zod-Schemas an API-Boundaries.
- `app/api/notify/email-out/route.ts` — Webhook-Stub, fungiert als Pass-Through wenn `NOTIFY_EMAIL_WEBHOOK_URL` gesetzt.
- `app/api/notify/push-out/route.ts` — analog für Push.
- Status-Logik in `lib/access.ts` so gekapselt, dass Phase-2-Webhooks nur die DB-Status-Felder schreiben müssen — die UI ändert sich nicht.

## ☁️ Vercel-Deploy (Schritt für Schritt)

### Variante A: GitHub-Import (empfohlen)

1. **Code zu GitHub pushen** (einmalig, läuft über deinen GitHub-Account):
   ```bash
   git push -u origin main
   ```
   Beim ersten Push wirst du nach **Username** + **Personal Access Token** gefragt
   (anstelle des Passworts; Token erstellen unter https://github.com/settings/tokens
   → Scope `repo`).

2. **Vercel** öffnen → eingeloggt mit GitHub.
3. **„Add New… → Project"** → Repository **`anlegerclub-app`** auswählen → **„Import"**.
4. Framework wird automatisch erkannt: **Next.js**.
5. **Root Directory** auf `apps/web` setzen.
6. **Environment Variables** (1 zwingend, Rest optional):
   - `NEXTAUTH_SECRET` = mit `openssl rand -base64 32` generieren (nötig in Prod).
   - `NEXTAUTH_URL` = `https://<dein-projekt>.vercel.app` (kann später auf eigene Domain).
7. **Deploy** klicken. Nach 60–90 Sek live.

### Variante B: CLI-Deploy (ohne GitHub)

```bash
npx vercel --prod
```
(Vercel-CLI wird beim ersten Lauf automatisch installiert. Folgt den interaktiven Prompts.)

## 🧪 Lokale Smoke-Tests

```bash
pnpm typecheck   # TypeScript across all packages
pnpm build       # Production build via turbo
pnpm dev         # Dev mode (HMR)
```

## 📦 Phase-2-Roadmap (laut Spec §17)

| Sprint | Inhalt | Geschätzte Kosten |
|---|---|---|
| **Sprint 0** ✅ | Repo-Setup, Mock-Daten, Vercel-Deploy | **0 €** |
| Sprint 1 | Admin-CRUD vervollständigen, Onboarding-Persistierung, Pitch-Editor live | 0 € |
| Sprint 2 | Postgres + Prisma + echte Auth, Ablefy-Webhooks, SMS-OTP | bis ~30 €/Mo |
| Sprint 3 | Push/Mail-Webhook live, Mux-Video-Pipeline | abh. von Volumen |
| Sprint 4 | React-Native-Apps (Expo + EAS) | $99/Jahr Apple |
| Sprint 5 | Gamma-AI-Pipeline, VTJ-Anbindung, Excel-Import | abh. von Gamma-Lizenz |
| Sprint 6 | Events-Modul, Self-Service-Account, Snowflake-Reporting | abh. |

Siehe `BUDGET.md` für das harte 100-€-Limit der Phase 1.

## 📨 Kontakt

Support: `info@traderiq.net`
