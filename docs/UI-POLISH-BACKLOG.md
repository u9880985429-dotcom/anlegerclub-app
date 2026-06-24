# UI-/Premium-Polish — Stand & Backlog

Grundlage: 5-Achsen-Audit (Architektur, Design-System, Member-UX, Performance/Motion, Barrierefreiheit),
umgesetzt mit den Skills `frontend-design`, `vercel-react-best-practices`, `vercel-react-view-transitions`,
`nextjs-app-router-patterns`, `review-animations`.

## ✅ In dieser Runde umgesetzt
- **Stufe D (Architektur):** `getMemberCounts()` → echte Mitgliederzahlen (behebt „Aktive Mitglieder: 0"); kpi vom lib-Layer entkoppelt. Rest der Entkopplung → `ARCHITEKTUR-BACKLOG-IT.md`.
- **Stufe B-Kern (Design-Tokens):** Display-Schrift *Space Grotesk* für Überschriften/Kennzahlen, Marken-Navy als echte Ink-Farbe, AA-taugliche Gewinn/Verlust-Farben, Karten-Hierarchie (`card-elevated`), tabellarische Ziffern.
- **Stufe A (Hygiene + Sprache):** interne Dev-/Roadmap-Hinweise aus dem Member-Bereich raus, Demo-Logins nur in Entwicklung, Eindeutschung (Welcome→Start, Calendar→Kalender, Take Profit→Gewinn mitnehmen), Rollen/Status in Klartext.
- **A11y/Perf-Wins:** globale Fokus-Ringe, `prefers-reduced-motion`-Modus, `optimizePackageImports` (lucide-react); Dashboard-Statkarten ohne Icon-Kachel-Klischee.

## ⏭️ Offener Polish (Folge-Runde)
Nach Hebel:

1. **Flüssige Übergänge (View Transitions)** — weiche Routen-/Tab-/Slider-Wechsel via Browser-`startViewTransition` (+ reduced-motion-Fallback). Skill: `vercel-react-view-transitions`. Größter „flüssig"-Hebel ohne 3D.
2. **Modal-Eintritt** — `WidgetGallery`/`WidgetSettingsModal` poppen hart; @starting-style + scale(0.97)→1 + opacity, 200ms ease-out (Skill `review-animations`).
3. **Schriftgrößen-Sweep** — ~248 Stellen mit `text-[10px]/[11px]` auf min. 14px anheben; optionaler „Große Schrift"-Modus (wichtig für 65-85).
4. **Touch-Targets 44px** über Buttons hinaus (Links/Icons in Listen).
5. **Landing-Page als Bento** + ein „Signature"-Element (eigene Trade-Signal-Darstellung TT.MM.JJJJ + farbcodierte Aktion), das in Hero/Dashboard/Depot wiederkehrt (Skill `frontend-design`).
6. **Client/Server-Grenze** — reine Darstellungs-Charts/Karten als RSC; KPI-Widget-Registry pro Widget lazy laden; `transition-all`→`transition-colors`, Progress-Bars via `transform:scaleX`.
7. **Admin-Seiten-Hygiene** — „Phase 2"-Hinweise auch in email-config/domains/subscriptions/integrations bereinigen (nur Owner-sichtbar, daher niedriger).
