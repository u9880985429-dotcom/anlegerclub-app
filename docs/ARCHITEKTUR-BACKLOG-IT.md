# Architektur-Backlog (modularer Monolith → Microservices)

Stand: Stufe D. Grundlage: Architektur-Audit (5-Achsen-Audit, Juni 2026).

## Bewertung (kurz)
Fundament ist **gut**: Alle Module (`customers`, `comments`, `kpi`, `ablefy`) haben saubere
`index.ts`-„Türen", es gibt **keine tiefen Cross-Modul-Importe**, Supabase-Zugriff ist in
`lib/supabase.ts` zentralisiert und liegt fast nur in den Repository-Dateien.

Microservice-Reife wird durch zwei systemische Lecks gebremst:
1. Der **Mock-Layer `@traderiq/api`** liefert nicht nur Daten, sondern auch Domänen-**Typen** bis in die Module hinein (falsche Abhängigkeitsrichtung: Domäne → Mock-Infrastruktur).
2. Zentrale Domänen-Daten (Ablefy-Events, Pending-Buyers) liegen im **flüchtigen In-Memory-Speicher** (`lib/`) statt in echten Repositories → blockiert horizontale Skalierung.

## ✅ In Stufe D erledigt (saubere Trennung, ohne DB-Migration)
- **D1 — kpi vom lib-Layer entkoppelt:** `AblefyProductMapping` läuft jetzt über die Tür `@/modules/ablefy` statt direkt aus `@/lib/ablefy-config` (`modules/kpi/bucket.ts`).
- **D2 — KPI auf echte Daten:** Mitgliederzahlen (aktiv/pausiert/beendet) kommen aus den echten `customer_subscriptions` (Supabase) über `getMemberCounts()` in `@/modules/customers`, mit Mock-Fallback für lokale Entwicklung. Behebt „Aktive Mitglieder: 0" im KPI-Dashboard (`app/(app)/admin/kpi/page.tsx`).

## ⏭️ Für die IT-/Datenmodell-Runde (bewusst zurückgestellt — berührt DB/Datenmodell)
Reihenfolge nach Hebel:

1. **Domänen-Contracts aus dem Mock lösen** (hoch)
   Eigenes `packages/contracts` (oder modul-lokale `types.ts`) für `Subscription`, `User`,
   `Comment`, `ProductSlug`, `Role`. `@traderiq/api` wird zum reinen Daten-Provider, der die
   Contracts *erfüllt*, nicht *definiert*. Betroffen u. a.: `modules/kpi/bucket.ts:1`,
   `modules/kpi/anomaly.ts:1`, `modules/customers/service.ts`, `modules/comments/types.ts:9`.
   Solange ein Modul `@traderiq/api` importiert, kann es nicht eigenständig Microservice werden.

2. **Ablefy-Modul vervollständigen** (hoch)
   `lib/ablefy-config.ts`, `lib/ablefy-events.ts`, `lib/ablefy-store.ts`,
   `lib/ablefy-pending-buyers.ts` ins `ablefy`-Modul ziehen. In-Memory-Stores
   (`ablefy-store.ts:41 events[]`, `ablefy-pending-buyers.ts:30 buyers[]`) durch
   **echte Supabase-Repositories** ersetzen (Tabellen `ablefy_events`, `ablefy_pending_buyers`)
   → braucht Migration. Danach ist `ablefy` ein klarer Service-Kandidat (Port = Webhook-Receiver).

3. **KPI vollständig auf echte Daten** (mittel)
   `kpi`-Service `computeKpiSnapshot`, der `byProduct`/Anomalien aus echten Subs zieht (statt
   `allSubscriptions`-Mock in `app/(app)/admin/kpi/page.tsx`, `.../sonstige-daten/page.tsx`,
   `PricingOverviewCard.tsx`). Hardcodierte Werte `avgArpu=89`, `newMembersThisMonth=14`,
   `churnedMembersThisMonth=3` (page.tsx) durch echte Aggregation ersetzen.

4. **Identity/Users-Modul** (mittel)
   Echtes `users`-Repository statt überall `allUsers` (Mock) — entkoppelt KPI, Kommentare und
   Auth gemeinsam vom Mock.

5. **Logik aus Route-Handlern in Module** (mittel)
   - `app/api/v1/comments/route.ts`: Author-Auflösung + Wordfilter + Badge-Logik in einen
     `comments`-Service; Handler ruft nur `createComment(session, body)`.
   - `app/api/v1/ablefy/diagnose/route.ts:58/94/109`: direkte `.from(...)`-Aufrufe durch
     Modul-Funktionen ersetzen (einziges DB-Leck außerhalb der Repos).

6. **Öffentliche `/api/v1`-Endpoints** (niedrig)
   `subscriptions`, `trades`, `users` liefern reine Mock-Daten als wären es Contracts —
   klar als „Demo/Stub" kennzeichnen oder auf echte Modul-Türen umstellen.

> Hinweis: Punkte 1, 2, 3, 4 berühren das Datenmodell / DB-Migrationen / Auth — bewusst der
> gemeinsamen IT-Runde überlassen. Die Türen sind so vorbereitet, dass das Umstellen lokal
> bleibt (Consumer importieren bereits über die Modul-Tür).
