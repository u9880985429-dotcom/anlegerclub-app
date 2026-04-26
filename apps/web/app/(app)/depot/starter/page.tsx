import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { PitchCard } from "@/components/PitchCard";
import { PitchBanner } from "@/components/PitchBanner";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { PerformanceChart } from "@/components/PerformanceChart";
import { VTJEmbed } from "@/components/VTJEmbed";
import { BrokerCard } from "@/components/BrokerCard";
import { EditModeBar } from "@/components/EditModeBar";
import { requireProductAccess } from "@/lib/access";
import {
  STARTER_PERFORMANCE,
  STARTER_STRATEGY,
  VTJ,
  daxMillionaerLessons,
  focusStocks,
  getReportsByProduct,
  getTradesByProduct,
  starterTrades,
} from "@traderiq/api";
import { formatGermanDate } from "@/lib/format";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StarterDepotPage() {
  const session = await requireProductAccess("starter");
  const trades = getTradesByProduct("starter");
  const reports = getReportsByProduct("starter");
  const isStarterOnly = session.user.productSlug === "starter";

  return (
    <>
      <PageHeader
        eyebrow="Starter Depot"
        title="Dein Starter Depot"
        description={`${trades.length} Trade-Signale · ${focusStocks.length} Aktien im Fokus · monatliche Auswertungen`}
      />

      <EditModeBar role={session.user.role} scope="Starter Depot" />

      {/* Permanenter Header-Pitch */}
      <PitchBanner variant="both" className="mb-6" />

      <Tabs defaultValue="welcome">
        <TabsList className="flex-wrap">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="strategie">Strategie & Performance</TabsTrigger>
          <TabsTrigger value="aktiensparplan">Trade Signale Aktiensparplan</TabsTrigger>
          <TabsTrigger value="dax">Trade Signale DAX-Millionär</TabsTrigger>
          <TabsTrigger value="auswertungen">Depotauswertungen</TabsTrigger>
          <TabsTrigger value="fokus">Aktie im Fokus</TabsTrigger>
          <TabsTrigger value="archiv">Archiv</TabsTrigger>
        </TabsList>

        {/* Welcome */}
        <TabsContent value="welcome">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VideoPlaceholder title="Welcome Starter Depot" duration="4:25" seed="starter-welcome" />
            </div>
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Dein Einstieg</h3>
              <p className="text-sm text-muted-foreground">
                Schau dir das Welcome-Video an (4:25 Min). Dort führt dich der Chefredakteur durch alle Funktionen des Starter Depots.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>✅ Tägliche Trade-Signale</li>
                <li>✅ Wöchentliche Aktie im Fokus</li>
                <li>✅ Monatliche Depot-Auswertung</li>
                <li>✅ DAX-MILLIONÄR-Strategie</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Strategie & Performance */}
        <TabsContent value="strategie">
          <div className="space-y-6">
            <article className="card-base p-6">
              <h3 className="mb-3 text-lg font-bold">Strategie</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {STARTER_STRATEGY}
              </p>
            </article>

            <PerformanceChart data={STARTER_PERFORMANCE} title="Starter Depot · Performance YTD" />

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

            <VTJEmbed title="Starter Depot · Live-Trade-Journal" />

            {/* Webinar + Strategy Pitches als sekundäre Banner */}
            <PitchBanner variant="both" />
          </div>
        </TabsContent>

        {/* Trade Signale Aktiensparplan */}
        <TabsContent value="aktiensparplan">
          <div className="space-y-4">
            {trades.map((t) => (
              <Link
                key={t.id}
                href={`/depot/starter/trade/${t.id}` as never}
                className="block transition hover:opacity-90"
              >
                <TradeRow trade={t} />
                <div className="mt-1 px-1 text-right text-xs font-semibold text-brand hover:underline">
                  Zum Signal →
                </div>
              </Link>
            ))}
            {/* Spec §14 — Pitch-Card am Ende, nur wenn user-product = starter */}
            {isStarterOnly && (
              <div className="pt-2">
                <PitchCard audienceProductSlug="starter" />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Trade Signale DAX-Millionär */}
        <TabsContent value="dax">
          <div className="space-y-4">
            {daxMillionaerLessons.map((l) => (
              <div key={l.id} className="card-base overflow-hidden">
                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-1">
                    <VideoPlaceholder title={l.title} duration="6:42" seed={l.id} />
                  </div>
                  <div className="p-5 md:col-span-2">
                    <span className="badge-brand mb-2">{l.section}</span>
                    <h3 className="text-base font-semibold">{l.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{l.bodyMd}</p>
                  </div>
                </div>
              </div>
            ))}
            {isStarterOnly && (
              <div className="pt-2">
                <PitchCard audienceProductSlug="starter" />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Depotauswertungen */}
        <TabsContent value="auswertungen">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 9).map((r) => (
              <article key={r.id} className="card-base overflow-hidden">
                <VideoPlaceholder title={r.monthLabel} duration="12:30" seed={r.id} />
                <div className="p-4">
                  <h3 className="text-sm font-semibold">{r.monthLabel}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {r.bodyMd.replace(/[#*`]/g, "")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        {/* Aktie im Fokus */}
        <TabsContent value="fokus">
          <div className="grid gap-4 md:grid-cols-2">
            {focusStocks.map((s) => (
              <article key={s.id} className="card-base p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-brand">{s.ticker}</span>
                  <span className="text-xs text-muted-foreground">{formatGermanDate(s.publishedAt)}</span>
                </div>
                <h3 className="text-sm font-semibold">{s.company}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.thesis}</p>
              </article>
            ))}
          </div>
        </TabsContent>

        {/* Archiv */}
        <TabsContent value="archiv">
          <div className="space-y-4">
            <div className="card-base p-5">
              <h3 className="mb-2 font-semibold">Vollständiges Archiv</h3>
              <p className="text-sm text-muted-foreground">
                Alle Trade-Signale, Auswertungen und Aktie-im-Fokus-Beiträge seit Auflegung des Starter-Depots am 01.02.2021.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reports.slice(3).map((r) => (
                <article key={r.id} className="card-base p-4">
                  <div className="text-sm font-semibold">{r.monthLabel}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
                </article>
              ))}
            </div>
            <div className="pt-2">
              <BrokerCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
