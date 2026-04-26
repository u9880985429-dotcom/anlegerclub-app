import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { Plus } from "lucide-react";
import { formatGermanDate } from "@/lib/format";

export default function AdminSubscriptionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Subscriptions"
        description="Manuell anlegen/editieren · Produkt-Slug + Ablefy-Order-ID"
        action={
          <button className="btn-brand inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Neue Subscription
          </button>
        }
      />

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Produkt</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ablefy-Order</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">Period End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allSubscriptions.map((s) => {
              const user = allUsers.find((u) => u.id === s.userId);
              const statusClass =
                s.status === "ACTIVE"
                  ? "badge-profit"
                  : s.status === "PAUSED"
                  ? "badge-base"
                  : "badge-loss";
              return (
                <tr key={s.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">{user?.firstName} {user?.lastName}</td>
                  <td className="px-4 py-3">
                    <span className="badge-brand font-mono">{s.productSlug}</span>
                  </td>
                  <td className="px-4 py-3"><span className={statusClass}>{s.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{s.ablefyOrderId ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{formatGermanDate(s.startedAt)}</td>
                  <td className="px-4 py-3 text-xs">{s.currentPeriodEnd ? formatGermanDate(s.currentPeriodEnd) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Phase 2: Ablefy-Webhook schreibt Status-Felder · UI ändert sich nicht.
      </div>
    </>
  );
}
