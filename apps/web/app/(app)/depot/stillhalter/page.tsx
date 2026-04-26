import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { PerformanceChart } from "@/components/PerformanceChart";
import { VTJEmbed } from "@/components/VTJEmbed";
import { BrokerCard } from "@/components/BrokerCard";
import { PitchBanner } from "@/components/PitchBanner";
import { EditModeBar } from "@/components/EditModeBar";
import { requireProductAccess } from "@/lib/access";
import {
  STILLHALTER_PERFORMANCE,
  STILLHALTER_STRATEGY,
  VTJ,
  getReportsByProduct,
  getTradesByProduct,
} from "@traderiq/api";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StillhalterDepotPage() {
  const session = await requireProductAccess("stillhalter");
  const trades = getTradesByProduct("stillhalter");
  const reports = getReportsByProduct("stillhalter");

  return (
    <>
      <PageHeader
        eyebrow="Stillhalter Depot"
        title="Stillhalter Depot"
        description="Cash-Secured Puts und Covered Calls auf solide US-Werte – monatlicher Prämien-Cashflow."
      />

      <EditModeBar role={session.user.role} scope="Stillhalter Depot" />

      <PitchBanner variant="strategy" className="mb-6" />

      <Tabs defaultValue="welcome">
        <TabsList className="flex-wrap">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="start">Start</TabsTrigger>
          <TabsTrigger value="signale">Trade-Signale</TabsTrigger>
          <TabsTrigger value="auswertungen">Depotauswertungen</TabsTrigger>
          <TabsTrigger value="archiv">Archiv</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VideoPlaceholder title="Welcome Stillhalter Depot" duration="6:14" seed="sth-welcome" />
            </div>
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Willkommen</h3>
              <p className="text-sm text-muted-foreground">
                Schau dir das Welcome-Video an. Anschließend findest du unter „Start" die Strategie-Erklärung, Performance und Brokerempfehlung.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="start">
          <div className="space-y-6">
            <article className="card-base p-6">
              <h3 className="mb-3 text-lg font-bold">Einführung ins Stillhalter Depot</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {STILLHALTER_STRATEGY}
              </p>
            </article>

            <PerformanceChart data={STILLHALTER_PERFORMANCE} title="Stillhalter Depot · Performance YTD 2025" />

            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Performance-Reporting</h3>
              <p className="text-sm text-muted-foreground">
                {VTJ.description} <strong>{VTJ.affiliateNote}</strong>
              </p>
              <a
                href={VTJ.affiliateUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-brand mt-4 inline-flex items-center gap-2"
              >
                Visual Trading Journal mit Trader-IQ-Vorteil
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <VTJEmbed title="Stillhalter Depot · Live-Trade-Journal" />

            <BrokerCard />
          </div>
        </TabsContent>

        <TabsContent value="signale">
          <div className="space-y-4">
            {trades.map((t) => (
              <Link
                key={t.id}
                href={`/depot/stillhalter/trade/${t.id}` as never}
                className="block transition hover:opacity-90"
              >
                <TradeRow trade={t} />
                <div className="mt-1 px-1 text-right text-xs font-semibold text-brand hover:underline">
                  Zum Signal →
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auswertungen">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 6).map((r) => (
              <article key={r.id} className="card-base overflow-hidden">
                <VideoPlaceholder title={r.monthLabel} duration="11:52" seed={r.id} />
                <div className="p-4">
                  <h3 className="text-sm font-semibold">{r.monthLabel}</h3>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archiv">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(6).map((r) => (
              <article key={r.id} className="card-base p-4">
                <div className="text-sm font-semibold">{r.monthLabel}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
