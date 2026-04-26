import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProductAccess } from "@/lib/access";
import { getFocusStockById, focusStocks } from "@traderiq/api";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { CommunityComposer } from "@/components/CommunityComposer";
import { LikeButton } from "@/components/LikeButton";
import { formatGermanDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FokusDetailPage({ params }: { params: { id: string } }) {
  await requireProductAccess("starter");
  const stock = getFocusStockById(params.id);
  if (!stock) notFound();

  const idx = focusStocks.findIndex((f) => f.id === stock.id);
  const prev = idx > 0 ? focusStocks[idx - 1] : null;
  const next = idx >= 0 && idx < focusStocks.length - 1 ? focusStocks[idx + 1] : null;

  return (
    <>
      <Link href="/depot/starter?tab=fokus" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Zur Übersicht „Aktie im Fokus"
      </Link>

      <article className="card-base p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="badge-brand">Aktie im Fokus</span>
            <h1 className="mt-2 text-2xl font-extrabold">
              <span className="font-mono text-brand">{stock.ticker}</span> · {stock.company}
            </h1>
            <div className="mt-1 text-xs text-muted-foreground">Veröffentlicht am {formatGermanDate(stock.publishedAt)}</div>
          </div>
        </div>

        <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">{stock.thesis}</p>

        <div className="mt-6">
          <VideoPlaceholder
            title={`Aktie im Fokus · ${stock.ticker}`}
            duration={stock.videoDuration ?? "8:00"}
            seed={stock.id}
          />
          <p className="mt-2 text-xs text-muted-foreground">Inhalte sind nicht herunterladbar – Wasserzeichen + DRM ab Phase 3 (Mux).</p>
        </div>

        <div className="prose-tiq mt-6 max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground">
          {stock.longTextMd}
        </div>

        <div className="mt-6">
          <LikeButton initialCount={Math.floor(Math.random() * 20) + 5} />
        </div>
      </article>

      {/* Diskussion zu diesem Beitrag */}
      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Diskussion</h2>
      <CommunityComposer placeholder="Frage stellen oder Erfahrung teilen…" contextHint="Diskussion zur Aktie im Fokus." />

      <div className="mt-6 flex items-center justify-between">
        {prev ? (
          <Link href={`/depot/starter/fokus/${prev.id}` as never} className="btn-secondary inline-flex items-center gap-2">
            ← {prev.ticker}
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/depot/starter/fokus/${next.id}` as never} className="btn-secondary inline-flex items-center gap-2">
            {next.ticker} →
          </Link>
        )}
      </div>
    </>
  );
}
