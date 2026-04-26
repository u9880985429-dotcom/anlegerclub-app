import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { requireProductAccess } from "@/lib/access";
import { lexikon, marketUpdates } from "@traderiq/api";
import { formatGermanDate } from "@/lib/format";
import { Calendar, FileText, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  await requireProductAccess("cockpit");
  const tag = marketUpdates.filter((u) => u.kind === "tag");
  const woche = marketUpdates.filter((u) => u.kind === "woche");
  const monat = marketUpdates.filter((u) => u.kind === "monat");

  return (
    <>
      <PageHeader
        eyebrow="Trader Cockpit"
        title="Trader Cockpit"
        description="Marktradar – Perspektiven, Tagesblicke, Wochenblicke und Monatsanalysen kompakt."
      />

      <Tabs defaultValue="welcome">
        <TabsList>
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="perspektiven">Perspektiven</TabsTrigger>
          <TabsTrigger value="tag">Tagesblick</TabsTrigger>
          <TabsTrigger value="woche">Wochenblick</TabsTrigger>
          <TabsTrigger value="monat">Monatsblick</TabsTrigger>
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
                9:34 Min Tour durch alle Module – Marktupdates, Lexikon, Economic Calendar, Perspektiven des Chefredakteurs.
              </p>
            </div>
            {/* Gamma-AI Slot (Phase 3 Platzhalter) */}
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

        <TabsContent value="tag">
          <UpdateGrid items={tag} />
        </TabsContent>
        <TabsContent value="woche">
          <UpdateGrid items={woche} />
        </TabsContent>
        <TabsContent value="monat">
          <UpdateGrid items={monat} />
        </TabsContent>

        <TabsContent value="calendar">
          <div className="card-base p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Economic Calendar — KW 17</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Datum</th><th>Uhrzeit</th><th>Land</th><th>Event</th><th>Wichtigkeit</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="py-2 font-mono">28.04.</td><td>14:30</td><td>🇺🇸</td><td>BIP Q1 (Vorab)</td><td>🔴🔴🔴</td></tr>
                <tr><td className="py-2 font-mono">29.04.</td><td>11:00</td><td>🇪🇺</td><td>Verbrauchervertrauen</td><td>🔴🔴</td></tr>
                <tr><td className="py-2 font-mono">30.04.</td><td>20:00</td><td>🇺🇸</td><td>Fed-Zinsentscheid</td><td>🔴🔴🔴</td></tr>
                <tr><td className="py-2 font-mono">02.05.</td><td>14:30</td><td>🇺🇸</td><td>Arbeitsmarktdaten (NFP)</td><td>🔴🔴🔴</td></tr>
              </tbody>
            </table>
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
