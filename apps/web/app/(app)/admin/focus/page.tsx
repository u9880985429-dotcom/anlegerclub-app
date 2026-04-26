import { PageHeader } from "@/components/PageHeader";
import { focusStocks } from "@traderiq/api";
import { Plus, Edit2 } from "lucide-react";
import { formatGermanDate } from "@/lib/format";

export default function AdminFocusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Aktie im Fokus"
        description={`${focusStocks.length} Einträge im Starter-Depot`}
        action={
          <button className="btn-brand inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Neue Aktie im Fokus
          </button>
        }
      />

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Unternehmen</th>
              <th className="px-4 py-3">Thesis</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {focusStocks.map((f) => (
              <tr key={f.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-mono text-xs">{formatGermanDate(f.publishedAt)}</td>
                <td className="px-4 py-3 font-mono font-bold text-brand">{f.ticker}</td>
                <td className="px-4 py-3">{f.company}</td>
                <td className="px-4 py-3 max-w-md text-xs text-muted-foreground">{f.thesis}</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-md p-1.5 hover:bg-accent"><Edit2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
