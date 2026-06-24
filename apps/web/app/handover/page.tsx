import { PrintButton } from "./PrintButton";

export const metadata = {
  title: "Trader IQ — Übergabe an die Geschäftsführung",
  description: "Status, offene Schritte, Phasen-Plan, Kosten und Übergabe-Anleitung",
};

export default function HandoverPage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Print-Controls (versteckt im Print) */}
      <div className="print:hidden border-b border-border bg-muted/40">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
          <div>
            <strong>Übergabe-Dokument · DIN A4</strong>
            <span className="ml-3 text-muted-foreground">
              Browser → <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-xs">⌘ + P</kbd> → „Als PDF speichern"
            </span>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* DIN A4 Document */}
      <article className="mx-auto max-w-[210mm] bg-white px-12 py-12 print:p-0 print:shadow-none">
        {/* Cover */}
        <header className="mb-10 border-b-4 border-brand pb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight">
                TRADER<span className="text-brand">IQ</span>
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Anlegerclub · Mitglieder-App
              </span>
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-brand">
              Übergabe
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold leading-tight">
            Übergabe an die Geschäftsführung
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Status der Phase-1-Demo · was für den Live-Start fehlt · Phasen-Plan ·
            Infrastruktur · API-Anbindungen · Kosten · Übergabe-Schritte
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Stand: 27.04.2026 · Erstellt für die Übergabe an Andrei (Owner)
          </p>
        </header>

        {/* TOC */}
        <nav className="mb-10 rounded-md border border-border bg-muted/30 p-5 print:break-inside-avoid">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Inhalt</h2>
          <ol className="grid gap-1.5 text-sm md:grid-cols-2">
            <li>1. Executive Summary</li>
            <li>2. Aktueller Stand (Phase 1)</li>
            <li>3. Was fehlt für Live-Go (Phase 2)</li>
            <li>4. Phasen-Übersicht</li>
            <li>5. Infrastruktur die wir brauchen</li>
            <li>6. API-Anbindungen, Webhooks, Plugins</li>
            <li>7. Übergabe an dich (Andrei)</li>
            <li>8. Kostenübersicht</li>
            <li>9. Empfohlene Reihenfolge</li>
            <li>10. Risiken &amp; offene Fragen</li>
          </ol>
        </nav>

        {/* SECTION 1 — EXECUTIVE SUMMARY */}
        <Section number="1" title="Executive Summary">
          <p>
            Die <strong>Trader-IQ-Anlegerclub-App</strong> ist als{" "}
            <strong>Phase-1-Demo auf Vercel live</strong>. Sie funktioniert vollständig — alle UI-Bereiche
            (Login, 4 Depots, Community, Admin-Backend, Push-Settings, Profilbilder) sind implementiert
            und mit realistischen Mock-Daten befüllt.
          </p>
          <p>
            <strong>Sie ist noch keine Produktiv-App</strong>: Logins, Subscriptions, Trades und Posts
            existieren nur in den Mock-Daten und gehen beim Page-Reload nicht verloren, sind aber nicht
            mit echten Systemen verbunden. Vor dem Echt-Start (= Phase 2) müssen extern angebunden werden:
          </p>
          <ul>
            <li>
              <strong>Ablefy-API</strong> (Subscription-Sync — wer hat was bezahlt, gekündigt, pausiert)
            </li>
            <li>
              <strong>PostgreSQL-Datenbank</strong> (für persistente User, Trades, Posts statt Mock-Daten)
            </li>
            <li>
              <strong>Echtes Auth-System</strong> mit Argon2-Passwörtern statt Demo-Passwort
            </li>
            <li>
              <strong>Twilio Verify</strong> für SMS-OTP beim Erstlogin
            </li>
            <li>
              <strong>Push-Provider</strong> (Expo + FCM für Android, APNs für iOS)
            </li>
            <li>
              <strong>Mux</strong> für DRM-geschütztes Video-Hosting (Welcome-Videos, Auswertungen)
            </li>
            <li>
              <strong>Cloudflare R2</strong> für User-Avatare + Community-Bild-Anhänge
            </li>
            <li>
              <strong>Mail-Webhook-Stack</strong> (Zapier oder n8n) für transaktionale Mails
            </li>
          </ul>
          <p>
            Die App-Architektur ist bewusst so gebaut, dass Phase 2 nahtlos drangebaut werden kann —
            der Service-Layer (`packages/api`) ist getrennt vom UI; nur die Mock-Repos müssen durch
            DB-Repos ersetzt werden.
          </p>
        </Section>

        {/* SECTION 2 — Aktueller Stand */}
        <Section number="2" title="Aktueller Stand (Phase 1) — was schon funktioniert">
          <SubHeading>2.1 Marketing &amp; Login</SubHeading>
          <ul>
            <li>Marketing-Splash auf <code>/</code> mit Hero, Feature-Grid, CTAs</li>
            <li>Landing-Page auf <code>/info</code> mit eingebettetem SharePoint-Vorstellungs-Video</li>
            <li>Login-Page mit 9 Demo-Accounts (siehe Übergabe-Sektion 7)</li>
            <li>Sperr-Screen <code>/locked</code> mit 3 personalisierten Texten (paused/expired/refunded)</li>
            <li>PWA-Setup: Wappen-Logo als Favicon + iPhone/Android-Installierbar via „Add to Homescreen"</li>
          </ul>

          <SubHeading>2.2 Mitgliederbereich (4 Depots)</SubHeading>
          <ul>
            <li>
              <strong>Starter Depot</strong> — Welcome-Video, Strategie + Performance, Trade Signale
              Aktiensparplan, Trade Signale DAX-Millionär (mit BUY/HOLD/SELL-Signalen),
              Depotauswertungen, Aktie im Fokus, Brokerempfehlung, Community, Archiv
            </li>
            <li>
              <strong>Trend Depot</strong> — Welcome, Strategie und Performance, Trade-Signale (10
              Einträge), Depotauswertungen, Brokerempfehlung (WH-Selfinvest), Community, Archiv
            </li>
            <li>
              <strong>Stillhalter Depot</strong> — analog Trend, mit Detail-Trades inkl. Multi-Tickers
              und Optionspositionen (CSP, Covered Call, Roll, Take-Profit)
            </li>
            <li>
              <strong>Trader Cockpit</strong> — Welcome-Video, Perspektiven des Chefredakteurs (mit
              Volltext + PDF-Download), Tagesblick / Wochenblick / Monatsblick (PDF-fähig),
              Anstehende Earnings (~150 S&amp;P-500-Werte mit Candlestick-Chart und IV),
              Economic Calendar, Lexikon, Community, Archiv
            </li>
          </ul>

          <SubHeading>2.3 Community pro Trade + freier Bereich</SubHeading>
          <ul>
            <li>Jeder Trade hat eine eigene Diskussionsseite mit Erklärvideo + Kommentaren</li>
            <li>Antworten auf einzelne Kommentare (verschachtelt, max 4 Ebenen)</li>
            <li>Eigene Kommentare bearbeiten + löschen, Mods/Admins/Owner können fremde verstecken</li>
            <li>Bild-/Screenshot-Upload (MEMBER 5/Beitrag, alle anderen unbegrenzt)</li>
            <li>Smiley-Picker mit den vom Spec definierten Reaktionen</li>
            <li>Wortfilter (DACH + EN Beleidigungen → mit Sternen maskiert + Mod-Notification)</li>
            <li>Werbung/Promo-Pattern blockieren das Absenden komplett</li>
            <li>Reactions: Like only (kein Dislike)</li>
          </ul>

          <SubHeading>2.4 Visual-Trading-Journal-Style Dashboard</SubHeading>
          <ul>
            <li>6 Tabs: Depotübersicht (Donut + Tachos + Tortendiagramme), Renditen &amp; Cashflow
              (24-Monats-Equity-Curve + Cashflow-Tabelle), Offene Positionen (sortierbare Tabelle),
              Geschlossene Positionen, Währungs-Positionen, APA (Apache-Beispiel)</li>
            <li>Daten orientiert an deinem Excel-Trade-Journal</li>
          </ul>

          <SubHeading>2.5 Admin-Backend</SubHeading>
          <ul>
            <li>Übersicht: Aktive Mitglieder + „Mitglieder mit Zahlungsschwierigkeiten" mit Liste</li>
            <li>Mitglieder-Liste mit Rolle-Dropdown (persistent via localStorage)</li>
            <li>Vollständige User-Detail-Seite mit Ablefy-Daten + Aktionen-Menü
              (Sperren/Abmahnen/Bezahlt-Status/Mail/Rolle ändern)</li>
            <li>Subscriptions &amp; Einladungen: Mailto-Versand mit Vorlage ODER Link kopieren —
              alle 5 Ablefy-Links hinterlegt</li>
            <li>Teammitglied-Einladungs-Form (nur OWNER + ADMIN sichtbar)</li>
            <li>Community-Moderation: Mod-Queue mit Auto-Hide + Auto-Reply („wird geprüft 48h"),
              User-Strikes-System mit Eskalations-Empfehlungen</li>
            <li><strong>API · Webhooks · Plugins</strong> — neue Sektion (nur OWNER + ADMIN)</li>
            <li>Granulare Bereichs-Berechtigungen pro User (12 Toggles)</li>
            <li>Audit-Log: Wer · Was · Wann · Warum</li>
          </ul>

          <SubHeading>2.6 Berechtigungs-Hierarchie</SubHeading>
          <ul>
            <li><strong>OWNER</strong> (du, Andrei) — kann jeden kicken, jede Rolle ändern, alles verwalten</li>
            <li><strong>ADMIN</strong> (Max) — fast alle Rechte, kann KEINEN OWNER, STAFF oder anderen ADMIN kicken</li>
            <li><strong>STAFF</strong> — Vollzugriff auf alle Depots (PAID), kann nicht einladen/kicken</li>
            <li><strong>MODERATOR</strong> — Community moderieren, Strikes vergeben</li>
            <li><strong>MEMBER</strong> — Standard-Mitglied</li>
          </ul>

          <SubHeading>2.7 Datenschutz</SubHeading>
          <ul>
            <li>MEMBER werden öffentlich nur mit „Vorname N." angezeigt (z.B. „Anna H.")</li>
            <li>Team-Mitglieder mit vollem Namen + Trader-IQ-Badge</li>
            <li>MODERATOR-Anzeige abhängig von Herkunft (aus MEMBER befördert vs. vom Team eingeladen)</li>
            <li>Profilbilder optional, lokal pro User</li>
          </ul>

          <SubHeading>2.8 Push-Benachrichtigungen (Settings)</SubHeading>
          <ul>
            <li>Channel-Toggles: Push + Mail</li>
            <li>Empfohlene Defaults: Trade-Signale + Marktanalysen (jederzeit abwählbar)</li>
            <li>Granular pro Depot: Community-Posts (nur für abonnierte Depots sichtbar)</li>
            <li>Persönlich: @-Mentions, Antworten auf eigene Kommentare, Redaktionsmeldungen</li>
          </ul>
        </Section>

        {/* SECTION 3 — Was fehlt für Live-Go */}
        <Section number="3" title="Was fehlt für den Live-Go (Phase 2)">
          <p>
            Sortiert nach Priorität — ohne <strong>Pflicht</strong>-Punkte geht's nicht live; <strong>Optional</strong>
            kann später nachgereicht werden, ohne dass die App unbenutzbar wird.
          </p>

          <SubHeading>3.1 Pflicht — ohne diese geht's nicht live</SubHeading>
          <table className="my-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="px-2 py-1.5">Was</th>
                <th className="px-2 py-1.5">Warum nötig</th>
                <th className="px-2 py-1.5">Aufwand</th>
              </tr>
            </thead>
            <tbody>
              <Tr a="PostgreSQL-DB (Neon, EU)" b="Persistente User, Trades, Subs, Comments — Mock-Daten gehen sonst beim DB-Reset verloren" c="3-5 Tage" />
              <Tr a="Prisma-Migration" b="Schema deployen, packages/db nutzt schon Prisma — fertig vorbereitet" c="1 Tag" />
              <Tr a="Echtes Auth (Argon2id)" b="Demo-Passwort 'traderiq2026' für alle ist nicht sicher" c="2 Tage" />
              <Tr a="Ablefy-API + Webhook" b="Ohne den Sync gibt's keine echten Mitglieder; Status-Updates müssen automatisch kommen" c="5-7 Tage" />
              <Tr a="Echte Email-Versand (Brevo/Postmark/SES)" b="Account-Aktivierung, Welcome-Mail, Pflicht-Push-Mails brauchen Mailing" c="1-2 Tage" />
              <Tr a="Vercel Production-Deployment hochstufen" b="Aktuell Free-Plan — bei mehr Traffic könnte es eng werden" c="halbe Stunde" />
              <Tr a="DSGVO-Texte (AGB, Datenschutz, Impressum)" b="Pflicht in DE; Texte muss du / Anwalt liefern" c="2-3 Tage Anwalt" />
            </tbody>
          </table>

          <SubHeading>3.2 Optional — sehr empfohlen, aber später nachrüstbar</SubHeading>
          <table className="my-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="px-2 py-1.5">Was</th>
                <th className="px-2 py-1.5">Warum sinnvoll</th>
                <th className="px-2 py-1.5">Aufwand</th>
              </tr>
            </thead>
            <tbody>
              <Tr a="Twilio Verify (SMS-OTP)" b="2FA beim Erstlogin — erhöht Sicherheit" c="1 Tag" />
              <Tr a="Push (Expo)" b="Native iOS/Android Push, Web-Push via VAPID — sonst keine Push-Wirkung" c="3-4 Tage" />
              <Tr a="Mux für Videos" b="DRM, Wasserzeichen, Streaming — sonst Videos manuell hochladen" c="2-3 Tage" />
              <Tr a="Cloudflare R2 / Vercel Blob" b="Profilbilder + Community-Anhänge in der Cloud (statt nur lokal im Browser)" c="1-2 Tage" />
              <Tr a="Outlook OAuth für Admin-Mailversand" b="Direktversand statt Mailto — professioneller" c="2 Tage" />
              <Tr a="Live-Earnings-API (Finnhub/FMP)" b="Aktuelle 500 S&P-Werte statt 150 Mocks im Cockpit" c="1 Tag" />
              <Tr a="VTJ-API-Anbindung" b="Live-Performance-Daten statt Excel-iframe" c="abhängig von VTJ" />
              <Tr a="Gamma-AI-Pipeline" b="Auto-PDF für ältere Marktupdates" c="abhängig von Gamma-Lizenz" />
              <Tr a="Volltext-Inhalte" b="12 Aktie-im-Fokus-Texte fehlen, ältere Marktupdates noch im Platzhalter-Zustand" c="redaktionell" />
            </tbody>
          </table>

          <SubHeading>3.3 Inhaltlich offen (kein Code-Aufwand, nur Texte)</SubHeading>
          <ul>
            <li><strong>Aktie im Fokus</strong> — 12 von 13 Beiträgen haben Platzhalter („Hier wurde noch kein Text hinterlegt"). Nur WBD ist gefüllt</li>
            <li><strong>Ablefy-API-Doku</strong> — Link zur API-Doku müsstest du mir noch geben für Phase 2</li>
            <li><strong>Anwalt-Texte</strong> — AGB, Datenschutzerklärung, Impressum (Phase 2 Pflicht)</li>
            <li><strong>Tatsächliche Mitarbeiter-Liste</strong> — wer bekommt welche Rolle bei Live-Start</li>
          </ul>
        </Section>

        {/* SECTION 4 — Phasen */}
        <Section number="4" title="Phasen-Übersicht">
          <p>
            Die App ist in 3 Phasen geplant. Aktuell sind wir am Ende von Phase 1 — Phase 2 ist der
            eigentliche Echt-Start.
          </p>

          <div className="my-4 grid gap-3">
            <PhaseBox
              num="1"
              title="Phase 1 — Demo (✅ ABGESCHLOSSEN)"
              status="erledigt"
              desc="Vollständige UI/UX, alle Bereiche bedienbar, mit realistischen Mock-Daten. Vercel-Deploy live. Demo-Logins zum Vorzeigen funktionieren."
              done
            />
            <PhaseBox
              num="2"
              title="Phase 2 — Live-Start mit echtem Backend"
              status="ausstehend"
              desc="DB + Auth + Ablefy + Push + Mail anbinden. Erste echte Mitglieder können sich registrieren, kaufen, einloggen, Trades sehen, in der Community schreiben. Geschätzt 4-6 Wochen, je nach Ablefy-Komplexität."
            />
            <PhaseBox
              num="3"
              title="Phase 3 — Native Apps + KI + Power-Features"
              status="optional / längerfristig"
              desc="React-Native/Expo-Apps für iOS+Android im App Store. Gamma-AI für automatische Marktanalyse-PDFs. VTJ-API-Anbindung statt iframe. Excel-Import/Export. In-App-Account-Self-Service. Snowflake-Reporting."
            />
          </div>
        </Section>

        {/* SECTION 5 — Infrastructure */}
        <Section number="5" title="Infrastruktur die wir brauchen">
          <SubHeading>5.1 Was schon läuft</SubHeading>
          <ul>
            <li><strong>Vercel</strong> (App-Hosting, EU/Frankfurt) — Frontend ist live</li>
            <li><strong>GitHub</strong> — Quellcode-Repo (privat empfohlen für Live-Phase)</li>
            <li><strong>Domain</strong> — vercel.app-Subdomain als Demo, später <code>app.traderiq.net</code> via Vercel Custom Domain</li>
          </ul>

          <SubHeading>5.2 Was wir buchen müssen (Phase 2)</SubHeading>
          <table className="my-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="px-2 py-1.5">Service</th>
                <th className="px-2 py-1.5">Warum</th>
                <th className="px-2 py-1.5">Region</th>
              </tr>
            </thead>
            <tbody>
              <Tr a="Neon (Postgres)" b="DB für User, Trades, Posts" c="EU/Frankfurt" />
              <Tr a="Upstash Redis (optional)" b="Session-Cache, Rate-Limiting" c="EU" />
              <Tr a="Cloudflare R2 oder Vercel Blob" b="Bilder + PDFs + Avatare" c="EU" />
              <Tr a="Mux Video" b="DRM-geschütztes Video-Streaming" c="multi-region" />
              <Tr a="Twilio Verify" b="SMS-OTP für 2FA" c="DE-Numbers" />
              <Tr a="Expo Push" b="iOS/Android-Push" c="global" />
              <Tr a="Sentry (optional)" b="Error-Tracking + Performance" c="EU" />
              <Tr a="Brevo (vormals SendinBlue) / Postmark" b="Transaktionale Mails" c="EU" />
            </tbody>
          </table>

          <SubHeading>5.3 DSGVO-Konformität</SubHeading>
          <ul>
            <li>Alle gewählten Services oben sind DSGVO-konform / haben EU-Server</li>
            <li>Auftragsverarbeitungsverträge (AVV) müssen mit jedem Provider abgeschlossen werden</li>
            <li>Cookie-Banner für Consent ist noch nicht eingebaut — wird in Phase 2 ergänzt</li>
          </ul>
        </Section>

        {/* SECTION 6 — APIs / Webhooks / Plugins */}
        <Section number="6" title="API-Anbindungen, Webhooks &amp; Plugins">
          <p>
            Im Admin-Backend gibt's bereits den Bereich <strong>API · Webhooks · Plugins</strong> mit der UI fürs
            Verwalten — die Anbindungen selbst müssen in Phase 2 echt implementiert werden.
          </p>

          <SubHeading>6.1 APIs zum Anbinden</SubHeading>
          <table className="my-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="px-2 py-1.5">Anbieter</th>
                <th className="px-2 py-1.5">Zweck</th>
                <th className="px-2 py-1.5">Du brauchst</th>
              </tr>
            </thead>
            <tbody>
              <Tr a="Ablefy API" b="Subscription-Sync (Bestellung, Stornierung, Zahlungsausfall)" c="API-Doku-URL + API-Key (von Ablefy anfordern)" />
              <Tr a="Twilio Verify" b="SMS-OTP-Versand" c="Account, ein DE-Number, Account-SID + Auth-Token" />
              <Tr a="Expo Push" b="Native iOS/Android-Push" c="Expo-Account, FCM-Server-Key, APNs-Cert" />
              <Tr a="Mux" b="Video-Hosting + Streaming" c="Mux-Account, API-Token + Signing-Key" />
              <Tr a="Cloudflare R2" b="Object-Storage" c="Cloudflare-Account, R2-Bucket + Access-Key" />
              <Tr a="Brevo / Postmark" b="Transaktionale Mails" c="Account, SMTP-Credentials oder API-Key" />
              <Tr a="Finnhub / FMP" b="Live-Earnings + IV (Cockpit)" c="kostenloser API-Key (limitiert) oder Paid-Tier" />
            </tbody>
          </table>

          <SubHeading>6.2 Webhooks (eingehend → an unsere App)</SubHeading>
          <ul>
            <li><code>/api/webhooks/ablefy</code> — Ablefy meldet uns: neue Bestellung, Storno, Zahlung fehlgeschlagen</li>
            <li><code>/api/webhooks/mux</code> — Mux meldet uns: Video-Upload fertig, Encoding done</li>
          </ul>

          <SubHeading>6.3 Webhooks (ausgehend → von unserer App)</SubHeading>
          <p>
            Im Admin-Backend → API · Webhooks → kannst du HTTPS-URLs hinzufügen, die bei bestimmten
            Events POST-Requests bekommen (z. B. an deinen Zapier/n8n-Stack). Verfügbare Events:
            <code>trade.published</code>, <code>trade.closed</code>, <code>report.published</code>,
            <code>user.subscribed</code>, <code>user.paused</code>, <code>user.expired</code>, <code>user.refunded</code>,
            <code>community.post.new</code>, <code>community.report.new</code>, <code>community.strike.issued</code>.
          </p>

          <SubHeading>6.4 Plugins (Marketplace im Admin)</SubHeading>
          <p>
            Bereits in der UI vorbereitet (9 Plugins listed): Ablefy Sync, Twilio Verify, Expo Push,
            Mux Video, Cloudflare R2, Vercel Blob, Gamma AI, Finnhub Earnings, n8n / Zapier Mail-Webhook.
            Die Buttons „Installieren" / „Konfigurieren" sind aktuell UI-Demos — sie müssen in Phase 2
            echte Konfigurations-Flows aufrufen.
          </p>
        </Section>

        {/* SECTION 7 — HANDOVER */}
        <Section number="7" title="Übergabe an dich (Andrei) — was du JETZT bekommst">
          <SubHeading>7.1 Dein Owner-Login</SubHeading>
          <div className="my-3 rounded-md border border-brand/40 bg-brand/5 p-4">
            <p>
              <strong>E-Mail:</strong> <code>andrei@traderiq.net</code>
              <br />
              <strong>Passwort:</strong> <code>traderiq2026</code> (Demo-Phase 1 — wird in Phase 2 mit echtem Passwort-Setup ersetzt)
              <br />
              <strong>Rolle:</strong> OWNER · Vollzugriff auf alles (Admin-Backend, Mitglieder kicken, Rollen vergeben, API-Keys, Webhooks, Plugins)
            </p>
          </div>

          <SubHeading>7.2 Was du als Owner alles tun kannst</SubHeading>
          <ul>
            <li>Mitglieder verwalten: Rolle ändern, sperren, abmahnen, auf „Bezahlt"-Status setzen</li>
            <li>Teammitglieder einladen (im Bereich „Mitglieder" oben rechts)</li>
            <li>Trade-Signale, Aktie im Fokus, Marktupdates, DAX-Millionär-Signale → <strong>direkt im jeweiligen Depot</strong> über den „Bearbeitungsmodus"-Button (oben in der Tab-Leiste)</li>
            <li>Onboarding-Slider, Pitch-Texte, Lexikon-Begriffe → ebenso im Bearbeitungsmodus</li>
            <li>Community-Moderation: Mod-Queue prüfen, User striken, sperren</li>
            <li>API-Keys generieren, Webhooks einrichten, Plugins aktivieren</li>
            <li>Granulare Bereichs-Berechtigungen pro User vergeben (z. B. nur API-Zugang für ITler)</li>
            <li>Subscriptions / Einladungen verschicken (mit Mail-Vorlage oder Link kopieren)</li>
            <li>Audit-Log einsehen (wer hat wann was gemacht)</li>
          </ul>

          <SubHeading>7.3 Wie du Inhalte pflegst (Bearbeitungsmodus)</SubHeading>
          <ol>
            <li>Im jeweiligen Depot oben in der Tab-Leiste auf <strong>„Seite bearbeiten"</strong> klicken</li>
            <li>Sektionen hinzufügen (z. B. „Webinar-Aufzeichnungen Q3 2026"), umbenennen oder verstecken</li>
            <li>„Speichern &amp; Schließen" — fertig</li>
            <li>In Phase 2 wird die Bearbeitung in der DB persistiert (aktuell: localStorage-Demo)</li>
          </ol>

          <SubHeading>7.4 Wo der Code liegt</SubHeading>
          <ul>
            <li>
              <strong>GitHub-Repo:</strong>{" "}
              <code>https://github.com/u9880985429-dotcom/anlegerclub-app</code>
            </li>
            <li><strong>Hosting:</strong> Vercel — automatischer Deploy bei jedem Git-Push</li>
            <li><strong>Live-URL:</strong> <code>https://anlegerclub-app-web.vercel.app</code></li>
            <li><strong>Eigenes Domain (später):</strong> <code>app.traderiq.net</code> via Vercel Custom Domain</li>
          </ul>

          <SubHeading>7.5 Mitarbeiter-Hierarchie heute</SubHeading>
          <table className="my-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="px-2 py-1.5">Rolle</th>
                <th className="px-2 py-1.5">Wer</th>
                <th className="px-2 py-1.5">Was kann er</th>
              </tr>
            </thead>
            <tbody>
              <Tr a="OWNER" b="Andrei (du)" c="Alles. Einzige Person die ADMIN/STAFF kicken kann." />
              <Tr a="ADMIN" b="Max" c="Fast alles. Kann KEINEN OWNER, STAFF oder anderen ADMIN kicken." />
              <Tr a="STAFF" b="(Demo-Account staff@)" c="Vollzugriff auf alle Depots (PAID). Kein Einladen / Kicken." />
              <Tr a="MODERATOR" b="(intern definieren)" c="Community moderieren (Posts verstecken, Strikes vergeben)." />
              <Tr a="MEMBER" b="zahlende Kunden" c="Standard-Zugriff auf eigene abonnierte Depots." />
            </tbody>
          </table>

          <SubHeading>7.6 Was du JETZT konkret tun solltest</SubHeading>
          <ol>
            <li>App im Browser öffnen, mit andrei@-Login einloggen</li>
            <li>Durch alle Bereiche durchklicken — Marketing, Login, alle 4 Depots, Community, Admin</li>
            <li>Ein Mitglied probeweise mit Rolle „MODERATOR" hochstufen → Reload → bleibt</li>
            <li>Einladungs-Mail an dich selbst probieren (Admin → Mitglieder → „Teammitglied einladen")</li>
            <li>API-Key generieren (Admin → Integrationen → Neuer API-Key)</li>
            <li>Mit anna.huber@example.com / traderiq2026 einloggen → siehst Member-Sicht (anonymisierte Namen)</li>
          </ol>
        </Section>

        {/* SECTION 8 — Kosten */}
        <Section number="8" title="Kostenübersicht">
          <SubHeading>8.1 Aktuell (Phase 1)</SubHeading>
          <div className="my-3 rounded-md border border-profit/40 bg-profit/5 p-4">
            <p>
              <strong>0 € pro Monat.</strong> Vercel Hobby-Plan, GitHub kostenlos, alles Mock-Daten.
            </p>
          </div>

          <SubHeading>8.2 Phase 2 (Live-Start)</SubHeading>
          <table className="my-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="px-2 py-1.5">Service</th>
                <th className="px-2 py-1.5">Plan</th>
                <th className="px-2 py-1.5">Kosten / Monat</th>
              </tr>
            </thead>
            <tbody>
              <Tr a="Vercel Pro" b="für Production-Traffic" c="20 € (oder Hobby = 0 € bei kleinem Traffic)" />
              <Tr a="Neon Postgres" b="Launch-Plan" c="0–25 € (free tier reicht initial)" />
              <Tr a="Cloudflare R2" b="Storage" c="ab 0,015 USD / GB / Monat — typisch 1–5 €" />
              <Tr a="Mux" b="Pay-as-you-go" c="≈ 5 € pro 100 GB Storage + Streaming" />
              <Tr a="Twilio Verify" b="SMS-OTP" c="ca. 0,05 € pro SMS — Login-Volumen-abhängig" />
              <Tr a="Expo Push" b="Free unlimited" c="0 €" />
              <Tr a="Brevo / Postmark" b="Mail" c="0–25 € (Free-Tier 300 Mails/Tag)" />
              <Tr a="Sentry (optional)" b="Error-Tracking" c="0 € (Free) bis 26 €" />
              <Tr a="Domain" b="app.traderiq.net" c="enthalten in deinem traderiq.net" />
            </tbody>
          </table>
          <p>
            <strong>Realistisch im ersten Jahr: 30–80 € / Monat</strong> bei moderatem Traffic (≤ 1000 aktive Mitglieder).
          </p>

          <SubHeading>8.3 Phase 3 (Native Apps)</SubHeading>
          <ul>
            <li>Apple Developer Program: 99 $ / Jahr</li>
            <li>Google Play Console: einmalig 25 $</li>
            <li>EAS Build (Expo): 0 $ Free oder 29 $/Mo bei viel Build-Volumen</li>
            <li>Gamma AI Lizenz: abhängig vom Plan</li>
          </ul>
        </Section>

        {/* SECTION 9 — Reihenfolge */}
        <Section number="9" title="Empfohlene Reihenfolge bis Live-Go">
          <ol className="space-y-2">
            <li>
              <strong>Woche 1:</strong> Anwalt mit AGB / DSGVO / Impressum beauftragen (parallel zum Rest)
            </li>
            <li>
              <strong>Woche 1:</strong> Ablefy-API-Doku-URL + API-Key besorgen
            </li>
            <li>
              <strong>Woche 1–2:</strong> Postgres (Neon) anlegen + Prisma-Migration deployen (Schema fertig)
            </li>
            <li>
              <strong>Woche 2:</strong> Echtes Auth — Argon2-Passwort-Hashes + Demo-Passwörter ablösen
            </li>
            <li>
              <strong>Woche 2–3:</strong> Ablefy-Webhook implementieren — Subscription-Sync getestet
            </li>
            <li>
              <strong>Woche 3:</strong> Mail-Versand (Brevo / Postmark) — Welcome-Mail, Pflicht-Push-Mail
            </li>
            <li>
              <strong>Woche 3–4:</strong> Cloudflare R2 für Avatare + Community-Anhänge
            </li>
            <li>
              <strong>Woche 4:</strong> Push (Expo) + SMS-OTP (Twilio) — beides parallel
            </li>
            <li>
              <strong>Woche 5:</strong> Mux einbinden + erste echte Welcome-Videos hochladen
            </li>
            <li>
              <strong>Woche 5:</strong> Inhalte: Anwalt-Texte, fehlende Aktie-im-Fokus-Beiträge schreiben
            </li>
            <li>
              <strong>Woche 6:</strong> Soft-Launch mit 5–10 internen Test-Usern
            </li>
            <li>
              <strong>Woche 6:</strong> Bug-Fixing + Public Launch
            </li>
          </ol>
          <p className="mt-3">
            <strong>Realistischer Time-to-Live: 6–8 Wochen</strong> mit einem Vollzeit-Entwickler. Mit
            mir parallel zur Beratung weniger Aufwand auf deiner Seite.
          </p>
        </Section>

        {/* SECTION 10 — Risiken */}
        <Section number="10" title="Risiken &amp; offene Fragen">
          <ul>
            <li>
              <strong>Ablefy-API-Komplexität</strong> — ohne API-Doku kann ich kein realistisches Aufwands-Schätzen.
              Erste Action für dich: API-Doku-URL beschaffen.
            </li>
            <li>
              <strong>DSGVO-Konsens</strong> — Cookie-Banner + Auftragsverarbeitungsverträge mit jedem Provider noch offen
            </li>
            <li>
              <strong>App-Store-Approval</strong> (Phase 3) — Apple ist streng bei Wrapper-Apps; PWA-Approach ist sicherer
            </li>
            <li>
              <strong>Datenschutz-Folgenabschätzung</strong> (DSGVO Art. 35) für hochsensible Finanz-Daten — Anwalt prüfen lassen
            </li>
            <li>
              <strong>Backup-Strategie</strong> für DB + Storage — muss dokumentiert sein
            </li>
            <li>
              <strong>Rate-Limiting</strong> auf Login + Sign-up — gegen Brute-Force, noch nicht implementiert
            </li>
            <li>
              <strong>Zahlungslogik</strong> — läuft komplett über Ablefy, also nicht unsere Verantwortung
              (= weniger Risiko, aber wir sind abhängig von Ablefy-Verfügbarkeit)
            </li>
          </ul>
        </Section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-4 text-xs text-muted-foreground print:break-inside-avoid">
          © {new Date().getFullYear()} Trader IQ Anlegerclub · info@traderiq.net · https://traderiq.net
          <br />
          Übergabe-Dokument · erstellt am 27.04.2026 · alle Aufwände sind Schätzungen, keine garantierten Werte.
        </footer>

        {/* Print-Styles */}
        <style>{`
          @media print {
            @page { size: A4; margin: 18mm; }
            body { background: white !important; }
            .print\\:hidden { display: none !important; }
            .print\\:break-inside-avoid { break-inside: avoid; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            section { break-inside: avoid-page; }
            h2 { break-after: avoid-page; }
          }
        `}</style>
      </article>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-baseline gap-3 border-b-2 border-brand pb-1 text-2xl font-extrabold">
        <span className="text-brand">{number}.</span> {title}
      </h2>
      <div className="prose-handover space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-5 text-base font-bold tracking-tight text-foreground">{children}</h3>
  );
}

function PhaseBox({
  num,
  title,
  status,
  desc,
  done,
}: {
  num: string;
  title: string;
  status: string;
  desc: string;
  done?: boolean;
}) {
  return (
    <div className={`rounded-md border-l-4 p-4 ${done ? "border-profit bg-profit/5" : "border-brand bg-brand/5"}`}>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-wider">
        <span className={`font-semibold ${done ? "text-profit" : "text-brand"}`}>Phase {num}</span>
        <span className="text-muted-foreground">{status}</span>
      </div>
      <h4 className="text-base font-bold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Tr({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <tr className="border-b border-border/50">
      <td className="px-2 py-1.5 align-top font-semibold">{a}</td>
      <td className="px-2 py-1.5 align-top text-muted-foreground">{b}</td>
      <td className="px-2 py-1.5 align-top text-muted-foreground">{c}</td>
    </tr>
  );
}
