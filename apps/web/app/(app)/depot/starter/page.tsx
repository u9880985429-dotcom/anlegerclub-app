import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { PitchCard } from "@/components/PitchCard";
import { PitchBanner } from "@/components/PitchBanner";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { VTJEmbed } from "@/components/VTJEmbed";
import { BrokerCard } from "@/components/BrokerCard";
import { EditModeBar } from "@/components/EditModeBar";
import { CommunityFeed } from "@/components/CommunityFeed";
import { requireProductAccess } from "@/lib/access";
import {
  STARTER_PERFORMANCE,
  STARTER_STRATEGY,
  VTJ,
  daxStrategieSignale,
  STRATEGIE_BADGE_CLASS,
  daxMillJahresRenditen,
  focusStocks,
  getReportsByProduct,
  getTradesByProduct,
  getPortfolioByProduct,
} from "@traderiq/api";
import { formatGermanDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const ABLEFY_ARCHIVE_LINK = "https://member.geldiq.com/s/geldiq/starter-depot-8740b018";

export default async function StarterDepotPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await requireProductAccess("starter");
  const trades = getTradesByProduct("starter");
  const reports = getReportsByProduct("starter");
  const portfolio = getPortfolioByProduct("starter")!;
  const isStarterOnly = session.user.productSlug === "starter";
  const activeTab = searchParams.tab ?? "welcome";

  return (
    <>
      <PageHeader
        eyebrow="Starter Depot"
        title="Dein Starter Depot"
        description={`${trades.length} Trade-Signale · ${focusStocks.length} Aktien im Fokus · monatliche Auswertungen`}
      />

      <EditModeBar role={session.user.role} scope="Starter Depot" />

      {/* Pitches NUR im Starter-Depot */}
      <PitchBanner variant="both" className="mb-6" />

      <Tabs defaultValue={activeTab} key={activeTab}>
        <TabsList className="hidden">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="strategie">Strategie & Performance</TabsTrigger>
          <TabsTrigger value="aktiensparplan">Trade Signale Aktiensparplan</TabsTrigger>
          <TabsTrigger value="dax">Trade Signale DAX-Millionär</TabsTrigger>
          <TabsTrigger value="auswertungen">Depotauswertungen</TabsTrigger>
          <TabsTrigger value="fokus">Aktie im Fokus</TabsTrigger>
          <TabsTrigger value="broker">Brokerempfehlung</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="archiv">Archiv</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VideoPlaceholder title="Welcome Starter Depot" duration="4:25" seed="starter-welcome" />
            </div>
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Dein Einstieg</h3>
              <p className="text-sm text-muted-foreground">Schau dir das Welcome-Video an. Anschließend findest du in den Tabs alle Bereiche.</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>✅ Tägliche Trade-Signale (Aktiensparplan + DAX-Millionär)</li>
                <li>✅ Wöchentliche Aktie im Fokus</li>
                <li>✅ Monatliche Depot-Auswertung</li>
                <li>✅ Community zu jedem Trade + freier Bereich</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="strategie">
          <div className="space-y-6">
            <article className="card-base p-6">
              <h3 className="mb-3 text-lg font-bold">Die Strategie des Starter Real-Depots</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{STARTER_STRATEGY}</p>
            </article>

            <PortfolioDashboard data={portfolio} />

            <PerformanceChart data={STARTER_PERFORMANCE} title="Starter Depot · Performance YTD" />

            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Performance-Reporting</h3>
              <p className="text-sm text-muted-foreground">{VTJ.description} <strong>{VTJ.affiliateNote}</strong></p>
              <a href={VTJ.affiliateUrl} target="_blank" rel="noreferrer" className="btn-brand mt-4 inline-flex items-center gap-2">
                Visual Trading Journal mit Trader-IQ-Vorteil
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <VTJEmbed title="Starter Depot · Live-Trade-Journal" />
          </div>
        </TabsContent>

        <TabsContent value="aktiensparplan">
          <div className="space-y-4">
            {trades.map((t) => (
              <Link key={t.id} href={`/depot/starter/trade/${t.id}` as never} className="block transition hover:opacity-90">
                <TradeRow trade={t} />
                <div className="mt-1 px-1 text-right text-xs font-semibold text-brand hover:underline">Zum Signal →</div>
              </Link>
            ))}
            {isStarterOnly && (
              <div className="pt-2">
                <PitchCard audienceProductSlug="starter" />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="dax">
          <div className="space-y-6">
            <article className="card-base p-5">
              <h3 className="mb-2 font-semibold">Strategie Signale (BUY · HOLD · SELL)</h3>
              <p className="text-sm text-muted-foreground">Unser Handelssystem generiert zum Monatsanfang ein klares Signal. So liest du es:</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-bold ${STRATEGIE_BADGE_CLASS.BUY}`}>BUY</span>
                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-bold ${STRATEGIE_BADGE_CLASS.HOLD}`}>HOLD</span>
                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-bold ${STRATEGIE_BADGE_CLASS.SELL}`}>SELL</span>
              </div>
            </article>

            <div className="space-y-3">
              {[...daxStrategieSignale].sort((a, b) => (a.monatId < b.monatId ? 1 : -1)).map((s) => (
                <article key={s.id} className="card-base p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{s.monatLabel}</div>
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${STRATEGIE_BADGE_CLASS[s.action]}`}>
                      {s.action}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold">{s.title}</h4>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{s.bodyMd}</p>
                </article>
              ))}
            </div>

            <article className="card-base p-5">
              <h3 className="mb-3 font-semibold">Jahresrenditen DAX-Millionär vs. DAX</h3>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2">Jahr</th><th className="py-2 text-right">Strategie</th><th className="py-2 text-right">DAX</th><th className="py-2 text-right">Diff</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {daxMillJahresRenditen.slice().reverse().map((r) => (
                    <tr key={r.year}>
                      <td className="py-2 font-mono">{r.year}</td>
                      <td className={`py-2 text-right font-mono font-semibold ${r.strategie >= 0 ? "text-profit" : "text-loss"}`}>
                        {r.strategie >= 0 ? "+" : ""}{r.strategie.toFixed(1).replace(".", ",")} %
                      </td>
                      <td className={`py-2 text-right font-mono ${r.dax >= 0 ? "text-profit" : "text-loss"}`}>
                        {r.dax >= 0 ? "+" : ""}{r.dax.toFixed(1).replace(".", ",")} %
                      </td>
                      <td className={`py-2 text-right font-mono text-xs ${r.strategie - r.dax >= 0 ? "text-profit" : "text-loss"}`}>
                        {(r.strategie - r.dax >= 0 ? "+" : "")}{(r.strategie - r.dax).toFixed(1).replace(".", ",")} pp
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            {isStarterOnly && (
              <div className="pt-2">
                <PitchCard audienceProductSlug="starter" />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="auswertungen">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 9).map((r) => (
              <article key={r.id} className="card-base overflow-hidden">
                <VideoPlaceholder title={r.monthLabel} duration="12:30" seed={r.id} />
                <div className="p-4">
                  <h3 className="text-sm font-semibold">{r.monthLabel}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fokus">
          <div className="grid gap-4 md:grid-cols-2">
            {focusStocks.map((s) => (
              <Link key={s.id} href={`/depot/starter/fokus/${s.id}` as never} className="card-base group block p-5 transition hover:border-brand/40">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-brand">{s.ticker}</span>
                  <span className="text-xs text-muted-foreground">{formatGermanDate(s.publishedAt)}</span>
                </div>
                <h3 className="text-sm font-semibold">{s.company}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.thesis}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                  Zur Aktie im Fokus → <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="broker">
          <BrokerCard />
        </TabsContent>

        <TabsContent value="community">
          <CommunityFeed slug="starter" />
        </TabsContent>

        <TabsContent value="archiv">
          <div className="space-y-4">
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Vollständiges Archiv</h3>
              <p className="text-sm text-muted-foreground">
                Alle Trade-Signale, Auswertungen und Aktie-im-Fokus-Beiträge seit Auflegung des Starter-Depots am 01.02.2021.
              </p>
              <div className="mt-3 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                💡 Jeder Kunde hat Zugang zum vollständigen Archiv im Ablefy-Mitgliederbereich. Nutze den Direkt-Link unten – dort findest du Beiträge, die älter als 12 Monate sind.
              </div>
              <a href={ABLEFY_ARCHIVE_LINK} target="_blank" rel="noreferrer" className="btn-brand mt-4 inline-flex items-center gap-2">
                Zum vollständigen Archiv bei Ablefy
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reports.slice(3).map((r) => (
                <a key={r.id} href={ABLEFY_ARCHIVE_LINK} target="_blank" rel="noreferrer" className="card-base block p-4 transition hover:border-brand/40">
                  <div className="text-sm font-semibold">{r.monthLabel}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    Bei Ablefy öffnen <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
