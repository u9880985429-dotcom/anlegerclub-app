import { PageHeader } from "@/components/PageHeader";
import { trendReports, stillhalterReports, starterReports, cockpitReports } from "@traderiq/api";
import { Plus, Edit2, Eye } from "lucide-react";
import { formatGermanDate } from "@/lib/format";

export default function AdminReportsPage() {
  const all = [
    ...trendReports.map((r) => ({ ...r, depot: "trend" })),
    ...stillhalterReports.map((r) => ({ ...r, depot: "stillhalter" })),
    ...starterReports.map((r) => ({ ...r, depot: "starter" })),
    ...cockpitReports.map((r) => ({ ...r, depot: "cockpit" })),
  ].sort((a, b) => (a.publishedAt && b.publishedAt && a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Depotauswertungen"
        description="Monatlich · Video-Asset-ID, PDF, Markdown"
        action={
          <button className="btn-brand inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Neue Auswertung
          </button>
        }
      />

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Monat</th>
              <th className="px-4 py-3">Depot</th>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">PDF</th>
              <th className="px-4 py-3">Veröffentlicht</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {all.slice(0, 30).map((r) => (
              <tr key={r.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-medium">{r.monthLabel}</td>
                <td className="px-4 py-3"><span className="badge-base">{r.depot}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{r.videoAssetId ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{r.pdfUrl ? "✓" : "—"}</td>
                <td className="px-4 py-3 text-xs">{r.publishedAt ? formatGermanDate(r.publishedAt) : "Entwurf"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-md p-1.5 hover:bg-accent" title="Vorschau"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="rounded-md p-1.5 hover:bg-accent" title="Bearbeiten"><Edit2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
