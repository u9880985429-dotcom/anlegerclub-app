import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { PitchCard } from "@/components/PitchCard";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { requireProductAccess } from "@/lib/access";
import {
  daxMillionaerLessons,
  focusStocks,
  getReportsByProduct,
  getTradesByProduct,
  starterTrades,
} from "@traderiq/api";
import Link from "next/link";
import { formatGermanDate } from "@/lib/format";

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
        description={`${trades.length} Trade-Signale, ${focusStocks.length} Aktien im Fokus, ${daxMillionaerLessons.length} DAX-MILLIONÄR-Lektionen.`}
      />

      <Tabs defaultValue="welcome">
        <TabsList>
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="strategie">Strategie & Performance</TabsTrigger>
          <TabsTrigger value="depot">Depot</TabsTrigger>
          <TabsTrigger value="dax">DAX MILLIONÄR</TabsTrigger>
          <TabsTrigger value="fokus">Aktie im Fokus</TabsTrigger>
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
                <li>✓ Tägliche Trade-Signale</li>
                <li>✓ Wöchentliche Aktie im Fokus</li>
                <li>✓ Monatliche Depot-Auswertung</li>
                <li>✓ DAX-MILLIONÄR-Strategie</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Strategie */}
        <TabsContent value="strategie">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="card-base p-5">
              <h3 className="mb-2 font-semibold">Strategie</h3>
              <p className="text-sm text-muted-foreground">
                Wir kombinieren Value-Aktien mit klar definierten Stops. Dadurch entsteht ein langfristig solides Aktiendepot mit überschaubarem Risiko.
              </p>
            </article>
            <article className="card-base p-5">
              <h3 className="mb-2 font-semibold">Depot + Performance</h3>
              <p className="text-sm text-muted-foreground">
                Aktuelle Depotzusammensetzung und Performance-Charts (interaktive Charts in Phase 2).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">YTD</div><div className="font-bold text-profit">+11,4 %</div></div>
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">Trefferquote</div><div className="font-bold">68 %</div></div>
              </div>
            </article>
            <article className="card-base p-5">
              <h3 className="mb-2 font-semibold">Trade Journal</h3>
              <p className="text-sm text-muted-foreground">
                Vollständige Historie aller Käufe und Verkäufe – exportierbar als Excel ab Phase 3.
              </p>
              <Link href="#trades" className="mt-3 inline-block text-sm text-brand underline">
                Direkt zum Journal →
              </Link>
            </article>
          </div>
        </TabsContent>

        {/* Depot (trades list + monthly reports + Pitch-Card) */}
        <TabsContent value="depot">
          <h2 id="trades" className="mb-3 text-lg font-semibold">Trade-Signale</h2>
          <div className="space-y-4">
            {trades.map((t) => (
              <TradeRow key={t.id} trade={t} />
            ))}

            {/* Spec §14: Pitch-Card am Ende der Trade-Liste, NUR wenn Produkt = starter */}
            {isStarterOnly && (
              <div className="pt-2">
                <PitchCard audienceProductSlug="starter" />
              </div>
            )}
          </div>

          <h2 className="mb-3 mt-10 text-lg font-semibold">Monatliche Auswertungen</h2>
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
          <div className="mt-4 text-center">
            <button className="btn-secondary">Archiv vollständig anzeigen</button>
          </div>
        </TabsContent>

        {/* DAX Millionär */}
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
      </Tabs>
    </>
  );
}
