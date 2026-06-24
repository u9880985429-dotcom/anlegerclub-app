import { PageHeader } from "@/components/PageHeader";
import { auditLog } from "@traderiq/api";
import { Filter, Search } from "lucide-react";
import { formatGermanDateTime } from "@/lib/format";

export default function AdminAuditPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Audit-Log"
        title="Audit-Log"
        description="Wer · Was · Wann · Warum (alle Admin-Aktionen)"
      />

      <div className="card-base mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Suche nach Action, Actor, Entity-ID…" />
        </div>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Action: Alle
        </button>
        <button className="btn-secondary">Export CSV</button>
      </div>

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Zeitpunkt</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity-ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditLog.map((a) => (
              <tr key={a.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-mono text-xs">{formatGermanDateTime(a.createdAt)}</td>
                <td className="px-4 py-3">{a.actorName}</td>
                <td className="px-4 py-3"><span className="badge-brand font-mono text-xs">{a.action}</span></td>
                <td className="px-4 py-3 text-xs">{a.entity}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Phase 2: vollständige Auditierung aller Schreib-Operationen (Trade-Publish, Mod-Aktionen, Status-Overrides, Pitch-Edits …).
      </div>
    </>
  );
}
