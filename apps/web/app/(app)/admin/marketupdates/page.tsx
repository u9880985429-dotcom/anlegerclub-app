import { PageHeader } from "@/components/PageHeader";
import { marketUpdates } from "@traderiq/api";
import { Plus, Edit2 } from "lucide-react";
import { formatGermanDate } from "@/lib/format";

export default function AdminMarketUpdatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Marktupdates"
        description={`Tag (${marketUpdates.filter((u) => u.kind === "tag").length}), Woche (${marketUpdates.filter((u) => u.kind === "woche").length}), Monat (${marketUpdates.filter((u) => u.kind === "monat").length})`}
        action={
          <button className="btn-brand inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Neues Update
          </button>
        }
      />

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {marketUpdates.map((u) => (
              <tr key={u.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-mono text-xs">{formatGermanDate(u.publishedAt)}</td>
                <td className="px-4 py-3"><span className="badge-brand">{u.kind}</span></td>
                <td className="px-4 py-3">{u.title}</td>
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
