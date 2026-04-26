import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { EarningsBrowser } from "@/components/EarningsBrowser";
import { EditModeBar } from "@/components/EditModeBar";
import { requireProductAccess } from "@/lib/access";
import { lexikon, marketUpdates, upcomingEarnings } from "@traderiq/api";
import { formatGermanDate } from "@/lib/format";
import { Calendar, FileText, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  const session = await requireProductAccess("cockpit");
  const tag = marketUpdates.filter((u) => u.kind === "tag");
  const woche = marketUpdates.filter((u) => u.kind === "woche");
  const monat = marketUpdates.filter((u) => u.kind === "monat");

  return (
    <>
      <PageHeader
        eyebrow="Trader Cockpit"
        title="Trader Cockpit"
        description="Marktradar – Perspektiven, Tagesblicke, Wochenblicke, Monatsanalysen, Earnings-Kalender und Lexikon."
      />

      <EditModeBar role={session.user.role} scope="Trader Cockpit" />

      <Tabs defaultValue="welcome">
        <TabsList className="flex-wrap">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="perspektiven">Perspektiven</TabsTrigger>
          <TabsTrigger value="tag">Tagesblick</TabsTrigger>
          <TabsTrigger value="woche">Wochenblick</TabsTrigger>
          <TabsTrigger value="monat">Monatsblick</TabsTrigger>
          <TabsTrigger value="earnings">Anstehende Earnings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="lexikon">Lexikon</TabsTrigger>
          <TabsTrigger value="archiv">Archiv</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VideoPlaceholder title="Onboarding Cockpit" duration="9:34" seed="cockpit-welcome" />
            </div>
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Willkommen im Cockpit</h3>
              <p className="text-sm text-muted-foreground">
                9:34 Min Tour durch alle Module – Marktupdates, Lexikon, Economic Calendar, Earnings-Browser und Perspektiven des Chefredakteurs.
              </p>
            </div>
            <article className="card-base relative overflow-hidden p-5 lg:col-span-3">
              <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                <Sparkles className="h-3 w-3" /> Phase 3
              </div>
              <h3 className="mb-2 font-semibold">Marktanalyse PDF (Gamma-AI)</h3>
              <p className="text-sm text-muted-foreground">
                Künftig: KI-gestützte tiefe Marktanalysen als PDF-Download. Generiert von Gamma-AI auf Basis der Trader-IQ-Daten.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Beispiel: „Marktblick Q2 2026.pdf" (32 Seiten · KI-generiert)</span>
              </div>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="perspektiven">
          <article className="card-base p-6">
            <span className="badge-brand mb-3">Diese Woche</span>
            <h3 className="text-lg font-semibold">Perspektiven des Chefredakteurs</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              „Die Märkte tanzen weiter zwischen Inflationssorgen und KI-Hoffnung. Meine Empfehlung für die kommenden 4 Wochen:
              Position Sizing reduzieren, Cash-Quote leicht erhöhen, Stops konsequent nachziehen. Die Saisonalität spricht ab Mitte Mai für eine Erholung..."
            </p>
            <div className="mt-4">
              <VideoPlaceholder title="Perspektiven KW 17" duration="18:24" seed="persp-kw17" />
            </div>
          </article>
        </TabsContent>

        <TabsContent value="tag"><UpdateGrid items={tag} /></TabsContent>
        <TabsContent value="woche"><UpdateGrid items={woche} /></TabsContent>
        <TabsContent value="monat"><UpdateGrid items={monat} /></TabsContent>

        {/* Anstehende Earnings — neu */}
        <TabsContent value="earnings">
          <div className="card-base mb-4 p-4">
            <h3 className="font-semibold">Anstehende US-Earnings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Suche nach Aktien-Symbol oder Firmenname. Du siehst den Kursverlauf seit den letzten Earnings sowie die implizite Volatilität (IV) – wichtig für Optionshändler.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase 1: Platzhalter-Daten · Phase 2: Live-Anbindung an Earnings-API.
            </p>
          </div>
          <EarningsBrowser entries={upcomingEarnings} />
        </TabsContent>

        <TabsContent value="calendar">
          <div className="card-base p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Economic Calendar — KW 17</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">Datum</th><th className="pr-4">Uhrzeit</th><th className="pr-4">Land</th><th className="pr-4">Event</th><th>Wichtigkeit</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-4 font-mono">28.04.</td><td className="pr-4">14:30</td><td className="pr-4">🇺🇸</td><td className="pr-4">BIP Q1 (Vorab)</td><td>🔴🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">29.04.</td><td className="pr-4">11:00</td><td className="pr-4">🇪🇺</td><td className="pr-4">Verbrauchervertrauen</td><td>🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">30.04.</td><td className="pr-4">20:00</td><td className="pr-4">🇺🇸</td><td className="pr-4">Fed-Zinsentscheid</td><td>🔴🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">02.05.</td><td className="pr-4">14:30</td><td className="pr-4">🇺🇸</td><td className="pr-4">Arbeitsmarktdaten (NFP)</td><td>🔴🔴🔴</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Phase 2: Live-Konsens, Vorperiode, Push-Reminder.</p>
          </div>
        </TabsContent>

        <TabsContent value="lexikon">
          <div className="grid gap-3 md:grid-cols-2">
            {lexikon.map((l) => (
              <article key={l.id} className="card-base p-4">
                <h3 className="text-sm font-bold text-brand">{l.term}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{l.definitionMd}</p>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archiv">
          <div className="card-base p-6 text-sm text-muted-foreground">
            Vollständiges Archiv aller Cockpit-Inhalte – chronologisch sortiert. (UI-Skeleton; volle Filterleiste in Phase 2.)
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function UpdateGrid({ items }: { items: typeof marketUpdates }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((u) => (
        <article key={u.id} className="card-base p-5">
          <div className="mb-2 text-xs text-muted-foreground">{formatGermanDate(u.publishedAt)}</div>
          <h3 className="text-base font-semibold">{u.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{u.bodyMd}</p>
        </article>
      ))}
    </div>
  );
}
