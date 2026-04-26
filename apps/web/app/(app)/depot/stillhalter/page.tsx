import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { TradeRow } from "@/components/TradeRow";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { requireProductAccess } from "@/lib/access";
import { getReportsByProduct, getTradesByProduct } from "@traderiq/api";

export const dynamic = "force-dynamic";

export default async function StillhalterDepotPage() {
  await requireProductAccess("stillhalter");
  const trades = getTradesByProduct("stillhalter");
  const reports = getReportsByProduct("stillhalter");

  return (
    <>
      <PageHeader
        eyebrow="Stillhalter Depot"
        title="Stillhalter Depot"
        description="Cash-Secured Puts und Covered Calls auf solide US-Werte – monatlicher Prämien-Cashflow."
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
                Das <strong>Stillhalter Depot</strong> verkauft systematisch Optionen auf solide US-Werte und vereinnahmt monatliche Prämien.
                Wir handeln <strong>Cash-Secured Puts</strong> und <strong>Covered Calls</strong> – Risikoprofil definiert, Cashflow planbar.
              </p>
            </article>
            <article className="card-base p-5">
              <h3 className="mb-2 font-semibold">Performance + Trade Journal</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">YTD Prämien</div><div className="font-bold text-profit">+8,9 %</div></div>
                <div className="rounded-md bg-muted p-3"><div className="text-muted-foreground text-xs">Win-Rate</div><div className="font-bold">82 %</div></div>
              </div>
            </article>
            <article className="card-base p-5 lg:col-span-3">
              <h3 className="mb-2 font-semibold">Brokerempfehlung</h3>
              <p className="text-sm text-muted-foreground">
                Für Optionen empfehlen wir <strong>Interactive Brokers</strong> (niedrige Margin) oder <strong>Tastytrade</strong> (Optionsspezialist mit unschlagbaren Gebühren).
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
            {reports.slice(3).map((r) => (
              <article key={r.id} className="card-base p-4">
                <div className="text-sm font-semibold">{r.monthLabel}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.bodyMd.replace(/[#*`]/g, "")}</p>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auswertung">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 3).map((r) => (
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
      </Tabs>
    </>
  );
}
