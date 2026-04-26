# Trader IQ – Budget-Vorgabe

**Hartes Limit: 100 € für Phase 1 (Prototyp).**
Ist-Verbrauch Phase 1: **0 €**. Alle Dienste auf Free-Tier.

## Phase 1 (heute): 0 €
- Vercel Hobby (Free)
- Keine Datenbank (Mock-Daten in-memory)
- Keine SMS, kein Push-Versand, kein Mail-Versand (nur Webhook-Stubs)
- Kein Mux (Video-Thumbnails sind Platzhalter-Gradienten)
- Keine Custom-Domain (Vercel-Subdomain reicht)

## Phase 2+ (NUR nach expliziter Freigabe pro Service)
| Service | Geschätzte Kosten | Trigger |
|---|---|---|
| Vercel Pro | $20 / Monat | nur wenn Traffic > 100 GB/Mo |
| Neon Postgres Pro | $19 / Monat | nur wenn Free-Tier-Limits gesprengt |
| Twilio SMS-OTP | ~€0,05 / SMS | bei Live-Schaltung Phase 2 |
| Mux Video | $0,005/Min Streaming | bei Live-Schaltung Video-Pipeline |
| Apple Developer | $99 / Jahr | bei App-Store-Einreichung Phase 3 |
| Google Play | $25 einmalig | bei Play-Store-Einreichung Phase 3 |

**Regel:** Vor jeder kostenpflichtigen Aktivierung Rückfrage an den Geschäftsführer.
