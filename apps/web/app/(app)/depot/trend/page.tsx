import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { requireProductAccess } from "@/lib/access";
import { getReportsByProduct, getTradesByProduct } from "@traderiq/api";

export const dynamic = "force-dynamic";

export default async function TrendDepotPage() {
  await requireProductAccess("trend");
  const trades = getTradesByProduct("trend");
  const reports = getReportsByProduct("trend");
  const archive = reports.slice(3);
  const recent = reports.slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Trend Depot"
        title="Trend Depot"
        description="Rein technische Strategie – wir folgen Trends, halten Gewinne, schneiden Verluste schnell."
      />

      <Tabs defaultValue="start">
        <TabsList>
          <TabsTrigger value="start">START</TabsTrigger>
          <TabsTrigger value="signale">Trade-Signale</TabsTrigger>
          <TabsTrigger value="archiv">Archiv</TabsTrigger>
          <TabsTrigger value="auswertung">Depotauswertung</TabsTrigger>
        </TabsList>

        <TabsContent value="start">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="card-base p-5 lg:col-span-2">
              <h3 className="mb-2 font-semibold">Einführung</h3>
              <p className="text-sm text-muted-foreground">
                Das <strong>Trend Depot</strong> folgt einem rein technischen Ansatz: wir kaufen Trends, halten Gewinne, schneiden Verluste schnell.
                Stops sind das Hauptwerkzeug der Risikokontrolle. Jede Position bekommt einen klar definierten Einstand, Stop und ein Ziel.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">YTD</div><div className="font-bold text-profit">+18,7 %</div></div>
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">Trefferquote</div><div className="font-bold">71 %</div></div>
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">Avg. Halten</div><div className="font-bold">23 Tage</div></div>
              </div>
            </article>
            <article className="card-base p-5">
              <h3 className="mb-2 font-semibold">Trade Journal</h3>
              <p className="text-sm text-muted-foreground">
                Live-Trade-Journal mit Einstand, Stop, Ziel und realisierter Performance. Phase 3: Excel-Export.
              </p>
            </article>
            <article className="card-base p-5 lg:col-span-3">
              <h3 className="mb-2 font-semibold">Brokerwahl</h3>
              <p className="text-sm text-muted-foreground">
                Empfohlene Broker für US-Aktien: <strong>Interactive Brokers</strong>, <strong>Captrader</strong>, <strong>Tastytrade</strong>. Niedrige Gebühren + voller Marktzugang.
              </p>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="signale">
          <div className="space-y-4">
            {trades.map((t) => (
              <TradeRow key={t.id} trade={t} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archiv">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {archive.map((r) => (
              <article key={r.id} className="card-base p-4">
                <div className="text-sm font-semibold">{r.monthLabel}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auswertung">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
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
      </Tabs>
    </>
  );
}
