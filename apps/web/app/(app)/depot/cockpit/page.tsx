import Link from "next/link";
import { ExternalLink, FileText, Sparkles, Calendar, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { EarningsBrowser } from "@/components/EarningsBrowser";
import { EditModeBar } from "@/components/EditModeBar";
import { CommunityFeed } from "@/components/CommunityFeed";
import { requireProductAccess } from "@/lib/access";
import { lexikon, marketUpdates, upcomingEarnings, cockpitDocuments } from "@traderiq/api";
import { formatGermanDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const ABLEFY_ARCHIVE_LINK = "https://member.geldiq.com/s/geldiq/trader-cockpit";

export default async function CockpitPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await requireProductAccess("cockpit");
  const tag = marketUpdates.filter((u) => u.kind === "tag");
  const woche = marketUpdates.filter((u) => u.kind === "woche");
  const monat = marketUpdates.filter((u) => u.kind === "monat");
  const docPerspektiven = cockpitDocuments.find((d) => d.kind === "perspektiven");
  const docTagesblick = cockpitDocuments.find((d) => d.kind === "tagesblick");
  const docWochenblick = cockpitDocuments.find((d) => d.kind === "wochenblick");
  const docMonatsblick = cockpitDocuments.find((d) => d.kind === "monatsblick");
  const docCalendar = cockpitDocuments.find((d) => d.kind === "calendar");
  const activeTab = searchParams.tab ?? "welcome";

  return (
    <>
      <PageHeader
        eyebrow="Trader Cockpit"
        title="Trader Cockpit"
        description="Marktradar – Perspektiven, Tagesblicke, Wochenblicke, Monatsanalysen, Earnings-Kalender und Lexikon."
      />

      <EditModeBar role={session.user.role} scope="Trader Cockpit" />

      <Tabs defaultValue={activeTab} key={activeTab}>
        <TabsList className="hidden">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="perspektiven">Perspektiven</TabsTrigger>
          <TabsTrigger value="tag">Tagesblick</TabsTrigger>
          <TabsTrigger value="woche">Wochenblick</TabsTrigger>
          <TabsTrigger value="monat">Monatsblick</TabsTrigger>
          <TabsTrigger value="earnings">Anstehende Earnings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="lexikon">Lexikon</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
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
                9:34 Min Tour durch alle Module – Marktupdates (PDF-Download), Lexikon, Economic Calendar, Earnings-Browser und Perspektiven.
              </p>
            </div>
            <article className="card-base relative overflow-hidden p-5 lg:col-span-3">
              <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                <Sparkles className="h-3 w-3" /> Phase 3
              </div>
              <h3 className="mb-2 font-semibold">Marktanalyse PDF (Gamma-AI)</h3>
              <p className="text-sm text-muted-foreground">
                Künftig: KI-gestützte tiefe Marktanalysen als PDF-Download – generiert von Gamma-AI auf Basis der Trader-IQ-Daten.
                Aktuell sind die Reports unter „Perspektiven", „Tagesblick", „Wochenblick", „Monatsblick" und „Calendar" als druck-/PDF-fähige Dokumente verfügbar.
              </p>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="perspektiven">
          {docPerspektiven && <DocCard doc={docPerspektiven} accent="Diese Woche" />}
        </TabsContent>

        <TabsContent value="tag">
          {docTagesblick && <DocCard doc={docTagesblick} accent="Heute" />}
          <UpdateGrid items={tag} />
        </TabsContent>

        <TabsContent value="woche">
          {docWochenblick && <DocCard doc={docWochenblick} accent="Diese Woche" />}
          <UpdateGrid items={woche} />
        </TabsContent>

        <TabsContent value="monat">
          {docMonatsblick && <DocCard doc={docMonatsblick} accent="Aktueller Monat" />}
          <UpdateGrid items={monat} />
        </TabsContent>

        <TabsContent value="earnings">
          <div className="card-base mb-4 p-4">
            <h3 className="font-semibold">Anstehende US-Earnings (S&P 500)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Suche nach Aktien-Symbol oder Firmenname. Du siehst den Kursverlauf seit den letzten Earnings sowie die implizite Volatilität (IV) – wichtig für Optionshändler.
            </p>
          </div>
          <EarningsBrowser entries={upcomingEarnings} />
        </TabsContent>

        <TabsContent value="calendar">
          {docCalendar && <DocCard doc={docCalendar} accent="Diese Handelswoche" />}
          <div className="card-base mt-4 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Economic Calendar — Quick-View KW 18</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">Datum</th><th className="pr-4">Uhrzeit</th><th className="pr-4">Land</th><th className="pr-4">Event</th><th>Wichtigkeit</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-4 font-mono">28.04.</td><td className="pr-4">16:00</td><td className="pr-4">🇺🇸</td><td className="pr-4">CB Consumer Confidence</td><td>🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">29.04.</td><td className="pr-4">14:30</td><td className="pr-4">🇺🇸</td><td className="pr-4">Durable Goods Orders</td><td>🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">29.04.</td><td className="pr-4">20:00</td><td className="pr-4">🇺🇸</td><td className="pr-4">Fed-Zinsentscheid</td><td>🔴🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">30.04.</td><td className="pr-4">14:30</td><td className="pr-4">🇺🇸</td><td className="pr-4">PCE + GDP Q1</td><td>🔴🔴🔴</td></tr>
                  <tr><td className="py-2 pr-4 font-mono">01.05.</td><td className="pr-4">16:00</td><td className="pr-4">🇺🇸</td><td className="pr-4">ISM Manufacturing PMI</td><td>🔴🔴</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Vollständiger Kalender mit Konsens, Vorperiode + Push-Reminder ab Phase 2.</p>
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

        <TabsContent value="community">
          <CommunityFeed slug="cockpit" />
        </TabsContent>

        <TabsContent value="archiv">
          <div className="space-y-4">
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Vollständiges Cockpit-Archiv</h3>
              <p className="text-sm text-muted-foreground">Alle vergangenen Tagesblicke, Wochenblicke, Monatsblicke und Perspektiven findest du im Ablefy-Mitgliederbereich.</p>
              <a href={ABLEFY_ARCHIVE_LINK} target="_blank" rel="noreferrer" className="btn-brand mt-4 inline-flex items-center gap-2">
                Zum Cockpit-Archiv bei Ablefy
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[...marketUpdates].reverse().slice(0, 9).map((u) => (
                <article key={u.id} className="card-base p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge-base">{u.kind}</span>
                    <span className="text-[10px] text-muted-foreground">{formatGermanDate(u.publishedAt)}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{u.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{u.bodyMd}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/cockpit/doc/${u.id}` as never}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-brand transition hover:border-brand/40"
                    >
                      <FileText className="h-3 w-3" /> PDF öffnen
                    </Link>
                    <a
                      href={ABLEFY_ARCHIVE_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
                    >
                      Ablefy <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function DocCard({ doc, accent }: { doc: { id: string; title: string; subtitle: string; date: string; bodyMd: string }; accent: string }) {
  // Show first ~3 paragraphs as preview
  const preview = doc.bodyMd.split("\n\n").slice(0, 4).join("\n\n");
  return (
    <article className="card-base p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="badge-brand">{accent}</span>
          <h3 className="mt-2 text-xl font-bold leading-snug">{doc.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{doc.subtitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">Stand: {formatGermanDate(doc.date + "T08:00:00Z")}</p>
        </div>
        <Link href={`/cockpit/doc/${doc.id}` as never} target="_blank" className="btn-brand inline-flex items-center gap-2">
          <FileText className="h-4 w-4" />
          PDF öffnen / Drucken
        </Link>
      </div>
      <div className="prose-tiq mt-4 max-w-none whitespace-pre-line text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {preview.replace(/^## /gm, "").replace(/\*\*(.+?)\*\*/g, "$1")}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Link href={`/cockpit/doc/${doc.id}` as never} target="_blank" className="btn-secondary inline-flex items-center gap-2">
          Vollständige Analyse lesen
          <Download className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function UpdateGrid({ items }: { items: typeof marketUpdates }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {items.map((u) => (
        <Link
          key={u.id}
          href={`/cockpit/doc/${u.id}` as never}
          target="_blank"
          className="card-base group block p-5 transition hover:border-brand/40"
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{formatGermanDate(u.publishedAt)}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
              <FileText className="h-3 w-3" /> PDF
            </span>
          </div>
          <h3 className="text-base font-semibold group-hover:text-brand">{u.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{u.bodyMd}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition group-hover:opacity-100">
            Als PDF öffnen <ExternalLink className="h-3 w-3" />
          </div>
        </Link>
      ))}
    </div>
  );
}
