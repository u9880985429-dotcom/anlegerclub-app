# 📋 Anlegerclub-Backlog

> **Stand: 2026-05-06** — direkt nach Iter 55 (Diagnose erweitert).
> Diese Datei ist deine **geordnete Wunschliste** für die App.
> Wir aktualisieren sie nach jeder fertigen Iteration.

---

## Wie diese Liste funktioniert

- **Oben = das, was als Nächstes gebaut wird.**
- **Reihenfolge ändern:** sag's mir kurz — du bestimmst die Reihenfolge.
- **Neue Idee?** sag Bescheid, ich nehme sie auf und sortiere sie ein.

### Status-Symbole

| Symbol | Bedeutung |
|---|---|
| 🟢 | bereit zum Loslegen |
| 🟡 | wartet auf eine andere Karte oder eine Info |
| ⛔ | blockiert (offene Frage muss erst geklärt werden) |
| ⚪ | offen, noch keine konkrete Planung |
| ✅ | erledigt |

### Größen-Schätzung

| Größe | Etwa |
|---|---|
| klein | 1–2 Stunden |
| mittel | halber Tag bis 1 Tag |
| groß | mehrere Tage / eigener Sprint |

---

## 🔥 Aktiv — was als Nächstes gebaut wird

### Iter 56 — User-Detail-Page für Ablefy-Kunden 🟢 bereit · mittel

**Was:** Klick auf einen Kunden in `/admin/users` → neue Seite `/admin/customers/[email]` öffnet sich mit allen Daten.

**Warum:** Du brauchst eine Übersicht pro Kunde + die Möglichkeit, Mitarbeiter / Mods / Admins hochzustufen.

**Plan (~2–3 Std, autonom):**
1. **SQL-Migration** — Spalte `role` in `customers`-Tabelle (Default: `MEMBER`).
2. **Neue Page** `/admin/customers/[email]` mit:
   - Vollständige Ablefy-Daten (Name, Mail, Payer-ID).
   - Liste aller Subscriptions (Order-ID, Produkt, Plan-Label, Status, Beträge, Datum).
   - Rollen-Auswahl: MEMBER → Mitarbeiter → Mod → Admin → Owner.
3. **Verlinkung** — Klick auf Ablefy-Kunden in `/admin/users` öffnet diese Seite.

---

### Iter 57 — Rollen-Dropdown direkt in der Liste 🟡 wartet auf 56 · klein

**Was:** Schnell-Rollenwechsel direkt in `/admin/users`, ohne erst auf die Detail-Seite zu klicken.

**Warum:** Bequemer für dich, wenn du mal eben mehrere Mitarbeiter auf einmal anpassen willst.

---

### Iter 58 — Brutto/Netto/MwSt-Aufteilung in Subscriptions 🟡 wartet · mittel

**Was:** `customer_subscriptions` bekommt zusätzliche Spalten:
- `gross_cents` (Brutto in Cent)
- `net_cents` (Netto in Cent)
- `vat_cents` (MwSt-Anteil in Cent)
- `vat_rate_percent` (MwSt-Satz in %)

Sync-Code liest diese Werte aus `line_items[0]` der Ablefy-Invoice. KPI-Widgets bekommen einen **Toggle „Netto / Brutto / MwSt"**.

**Warum:** Du willst KPIs auch netto sehen können (für Steuer-Sicht).

---

### Iter 59 — KPI „Sonstige Daten" chronologisch + Mail-Status 🟡 wartet · mittel

**Was:** Erweiterung der Seite `/admin/kpi/sonstige-daten`:
- Bestelldatum (Standard-Sortierung absteigend)
- Name + Mail
- Produkt
- **Double-Opt-In bestätigt?** (kommt aus Quentn → setzt Iter 60 voraus)
- **Mails (gesendet / geöffnet / geklickt)** (kommt aus Quentn → setzt Iter 60 voraus)

**Warum:** Du willst auf einen Blick sehen, wer was gekauft hat und wie es mit den Mails läuft.

**Hinweis:** Die ersten 3 Spalten (Datum, Name, Produkt) gehen sofort. Die letzten 2 (Mail-Status) erst wenn Iter 60 (Quentn-Anbindung) steht.

---

### Iter 60 — Quentn-Anbindung über Zapier ⛔ blockiert · mittel

**Was:** Quentn schickt Mail-Events (geöffnet, geklickt, Welcome-Mail gesendet) per Zapier-Zap an unsere App. Wir speichern sie pro Kunde in einer neuen Tabelle `customer_email_events`.

**Warum:** Damit du im Anlegerclub-Admin siehst, was bei deinen Kunden in Sachen Mail-Engagement los ist.

**⛔ Offene Frage (vor Start klären):**
> **Hat Trader-IQ schon einen aktiven Zapier-Account?**
> Falls ja: Pro-Plan oder Free? (Pro = unbegrenzte Zaps, Free = max. 5)
>
> Falls nein: Wir richten einen ein, sobald die Iter 56–59 durch sind.

---

### Sprint A — Login-Flow für Bestandskunden 🟡 wartet · groß

**Was:** Bestandskunden aus Ablefy können sich erstmals in der App einloggen.

**Inhalt:**
1. Login-Seite mit Hinweis „Nutze die Mail aus Ablefy".
2. Lookup gegen Ablefy: gibt's diese Mail mit aktivem Produkt?
3. Wenn ja + noch kein Passwort: Passwort-Vergabe-Seite + SMS-Bestätigung.
4. Wenn ja + schon Passwort: Login + „Passwort vergessen?"-Link.
5. Wenn nein: freundlicher Hinweis.

**Warum:** Ohne Login können die 526 Ablefy-Kunden gar nicht in der App ankommen.

**Größe:** ~2 Tage zusammen mit deinem Kollegen + mir.

**Hinweis:** Owner will **kein Trial-End-Tracking** und **keine Welcome-Mail** aus unserer App (siehe Memory). Reines Login + Passwort + SMS.

---

### Profilbild-Cloud-Upload 🟡 wartet · mittel

**Was:** Profilbilder werden in Supabase Storage abgelegt, nicht mehr nur im Browser.

**Regeln (siehe Memory):**
- ✅ Nur Gesichter (echte Personen).
- ❌ Keine Logos / Schriften / Symbole.
- **Mitglieder** dürfen ihr eigenes Bild hochladen.
- **Owner / Admin** dürfen Bilder für alle Mitarbeiter setzen, ohne deren Zustimmung.

---

### Plecto-Dashboards einbetten ⚪ offen · klein

**Was:** Plecto-Live-Dashboards als iframe in `/admin/kpi` einbinden.

**Warum:** Wenn ihr Plecto eh nutzt, sieht es in der App „aus einem Guss" aus, statt dass ihr in ein anderes Tool wechseln müsst.

**Wann sinnvoll:** Wenn deine KPI-Eigenbau-Seiten zu eng werden oder Plecto Sachen kann, die wir nicht selber bauen wollen.

---

### Legal-Texte (vor Go-Live) ⚪ offen · klein

**Wer macht's:** Owner selber, ganz zum Schluss.

- [ ] **AGB** — Editor existiert: `/admin/legal/agb`
- [ ] **Datenschutzerklärung** — Editor existiert: `/admin/legal/datenschutz`
- [ ] **Impressum** — Editor existiert: `/admin/legal/impressum`
- [ ] **Disclaimer „keine Anlageberatung"** — Editor noch zu bauen + Einbindung in Footer / Trade-Detail-Page.

**Warum:** Ohne diese Texte darf die App nicht öffentlich live gehen (rechtliche Pflicht).

---

## 🚫 Bewusst NICHT geplant

Diese Punkte bleiben so, solange du nichts anderes sagst:

- ❌ **Trial-End-Reminder** an Kunden — du willst Kunden nicht ans Trial-Ende erinnern.
- ❌ **Welcome-Mail aus unserer App** — die kommt aus Ablefy raus, dort ist auch der Verweis auf unsere App drin.
- ❌ **Eigenes Bezahl-System** — Ablefy bleibt.
- ❌ **Eigenes Mail-System** — Quentn bleibt für Marketing-Mails.

---

## 💡 Spätere Ideen (= „wäre nett, eilt nicht")

- Live-Dashboard für die Bürowand (Wettbewerbe, Realtime-KPI).
- Englische Sprache als zweite Option.
- Mobile-App (erst PWA, später vielleicht nativ).
- Eigene Mail-Templates / Mail-Versand für interne Mails (z.B. Passwort-Reset).
- Notification-Center (App-interne Benachrichtigungen).
- Reputation-/Karma-System für Community-Mitglieder.

---

## ✅ Zuletzt erledigt (Auszug)

| Iter | Was |
|---|---|
| 55 | Diagnose erweitert um sample customer + sub-count |
| 54 | Diagnose zeigt SUPABASE_URL-Wert + Key-Praefixe |
| 53 | Diagnose-Knopf + sichtbarer Save-Status |
| 52 | Sync-Mapping an echte Ablefy-Felder angepasst |
| 51 | Debug-Knopf „Rohdaten zeigen" |
| 50 | 5-Schritte-Morgen-Anleitung (`docs/MORGENS-LESEN.md`) |
| 49 | Webhook-Auto-Customer-Anlage + Lifecycle-Status-Sync |
| 48 | Bestandsdaten-Import — Customer + Subscription in Supabase |
| 47 | Sync-Limit von 500 auf 20.000 Rechnungen erhöht |
| 46 | AblefyManager — DB-Werte nur übernehmen wenn nicht leer |
| 45 | Ablefy-Konfig in Supabase persistiert |
| 44 | Quick-Add für 4 Einzeldepots im Produkt-Mapping |
| 43 | Supabase-Anbindung — Comments persistent |

Komplette Historie: `git log --oneline`.

---

## 🧭 Roter Faden für die nächsten Wochen

```
Iter 56 → 57 → 58 → 59  ➜  Customer-Verwaltung + KPI-Feinschliff
                              (du bekommst volle Übersicht über alle Kunden)
                                       ↓
              Iter 60   ➜  Quentn-Anbindung
                              (Mail-Status sichtbar in der App)
                                       ↓
             Sprint A   ➜  Login-Flow für Bestandskunden
                              (526 Ablefy-Kunden können sich erstmals einloggen)
                                       ↓
        Profilbilder    ➜  Cloud-Upload mit Regeln
                                       ↓
        Legal-Texte     ➜  Owner schreibt selber
                                       ↓
                       🚀  GO-LIVE
```

---

*Diese Datei wird nach jeder Iteration aktualisiert. Sag mir, wenn du eine Karte verschieben, ergänzen oder löschen willst.*
