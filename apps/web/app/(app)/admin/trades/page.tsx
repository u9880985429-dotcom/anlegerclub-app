import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { allTrades } from "@traderiq/api";
import { Plus, Edit2, Send } from "lucide-react";
import { ACTION_LABELS, formatGermanDate } from "@/lib/format";

export default function AdminTradesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Trade-Signale"
        description="CRUD pro Depot · Veröffentlichen-Button triggert Push/Mail-Webhook"
        action={
          <Link href={"/admin/trades/new" as never} className="btn-brand inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Neuer Trade
          </Link>
        }
      />

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Depot</th>
              <th className="px-4 py-3">Aktion</th>
              <th className="px-4 py-3">Tickers</th>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allTrades.map((t) => (
              <tr key={t.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-mono text-xs">{formatGermanDate(t.date)}</td>
                <td className="px-4 py-3"><span className="badge-base">{t.productSlug}</span></td>
                <td className="px-4 py-3 text-xs">{ACTION_LABELS[t.action]}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.tickers.join(", ")}</td>
                <td className="px-4 py-3 max-w-[300px] truncate">{t.title}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-md p-1.5 hover:bg-accent" title="Bearbeiten">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-md p-1.5 text-brand hover:bg-brand/15" title="Push + Mail senden">
                      <Send className="h-3.5 w-3.5" />
                    </button>
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
