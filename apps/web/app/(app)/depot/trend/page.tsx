import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { PerformanceChart } from "@/components/PerformanceChart";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { VTJEmbed } from "@/components/VTJEmbed";
import { BrokerCard } from "@/components/BrokerCard";
import { EditModeBar } from "@/components/EditModeBar";
import { CommunityFeed } from "@/components/CommunityFeed";
import { requireProductAccess } from "@/lib/access";
import {
  TREND_PERFORMANCE,
  TREND_STRATEGY,
  VTJ,
  getReportsByProduct,
  getTradesByProduct,
  getPortfolioByProduct,
} from "@traderiq/api";

export const dynamic = "force-dynamic";

const ABLEFY_ARCHIVE_LINK = "https://member.geldiq.com/s/geldiq/trend-depot-c8b71c4e";

export default async function TrendDepotPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await requireProductAccess("trend");
  const trades = getTradesByProduct("trend");
  const reports = getReportsByProduct("trend");
  const portfolio = getPortfolioByProduct("trend")!;
  const activeTab = searchParams.tab ?? "welcome";

  return (
    <>
      <PageHeader
        eyebrow="Trend Depot"
        title="Trend Depot"
        description="Rein technische Strategie – wir folgen Trends, halten Gewinne, schneiden Verluste schnell."
      />

      <EditModeBar role={session.user.role} scope="Trend Depot" />

      <Tabs defaultValue={activeTab} key={activeTab}>
        <TabsList className="hidden">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="start">Start</TabsTrigger>
          <TabsTrigger value="signale">Trade-Signale</TabsTrigger>
          <TabsTrigger value="auswertungen">Depotauswertungen</TabsTrigger>
          <TabsTrigger value="broker">Brokerempfehlung</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="archiv">Archiv</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VideoPlaceholder title="Welcome Trend Depot" duration="5:18" seed="trend-welcome" />
            </div>
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Willkommen</h3>
              <p className="text-sm text-muted-foreground">
                Schau dir das Welcome-Video an. Anschließend findest du unter „Start" die Einführung, Performance und Brokerempfehlung.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="start">
          <div className="space-y-6">
            <article className="card-base p-6">
              <h3 className="mb-3 text-lg font-bold">Einführung ins Trend Depot</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{TREND_STRATEGY}</p>
            </article>

            <PortfolioDashboard data={portfolio} />

            <PerformanceChart data={TREND_PERFORMANCE} title="Trend Depot · Performance YTD 2026" />

            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Performance-Reporting</h3>
              <p className="text-sm text-muted-foreground">{VTJ.description} <strong>{VTJ.affiliateNote}</strong></p>
              <a href={VTJ.affiliateUrl} target="_blank" rel="noreferrer" className="btn-brand mt-4 inline-flex items-center gap-2">
                Visual Trading Journal mit Trader-IQ-Vorteil
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <VTJEmbed title="Trend Depot · Live-Trade-Journal" />
          </div>
        </TabsContent>

        <TabsContent value="signale">
          <div className="space-y-4">
            {trades.map((t) => (
              <Link key={t.id} href={`/depot/trend/trade/${t.id}` as never} className="block transition hover:opacity-90">
                <TradeRow trade={t} />
                <div className="mt-1 px-1 text-right text-xs font-semibold text-brand hover:underline">Zum Signal →</div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auswertungen">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 6).map((r) => (
              <article key={r.id} className="card-base overflow-hidden">
                <VideoPlaceholder title={r.monthLabel} duration="14:08" seed={r.id} />
                <div className="p-4">
                  <h3 className="text-sm font-semibold">{r.monthLabel}</h3>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="broker">
          <BrokerCard />
        </TabsContent>

        <TabsContent value="community">
          <CommunityFeed slug="trend" />
        </TabsContent>

        <TabsContent value="archiv">
          <div className="space-y-4">
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Vollständiges Archiv</h3>
              <p className="text-sm text-muted-foreground">Beiträge älter als 12 Monate findest du im Ablefy-Mitgliederbereich.</p>
              <a href={ABLEFY_ARCHIVE_LINK} target="_blank" rel="noreferrer" className="btn-brand mt-4 inline-flex items-center gap-2">
                Zum vollständigen Archiv bei Ablefy
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reports.slice(6).map((r) => (
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
