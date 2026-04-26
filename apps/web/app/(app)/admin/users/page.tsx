import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { Search, Filter, MoreHorizontal } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Users"
        description={`${allUsers.length} Mitglieder · Filter, Status-Override, Notizen, Aktivität`}
      />

      <div className="card-base mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Suche nach Name, E-Mail, Ablefy-ID…" />
        </div>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Status: Alle
        </button>
        <button className="btn-secondary">Export CSV</button>
      </div>

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">E-Mail</th>
              <th className="px-4 py-3">Rolle</th>
              <th className="px-4 py-3">Produkt</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Logins</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allUsers.map((u) => {
              const sub = allSubscriptions.find((s) => s.userId === u.id);
              const statusClass =
                sub?.status === "ACTIVE"
                  ? "badge-profit"
                  : sub?.status === "PAUSED"
                  ? "badge-base"
                  : sub?.status === "CANCELLED"
                  ? "badge-base"
                  : "badge-loss";
              return (
                <tr key={u.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge-base">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{sub?.productSlug ?? "—"}</td>
                  <td className="px-4 py-3">
                    {sub ? <span className={statusClass}>{sub.status}</span> : <span className="badge-base">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.loginCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-md p-1.5 hover:bg-accent" title="Aktionen">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Phase 2: Status-Override-Modal (z. B. „Manuell auf ACTIVE setzen für 7 Tage"), Notizen-Feld, Login-Aktivitätstabelle pro User.
      </div>
    </>
  );
}
