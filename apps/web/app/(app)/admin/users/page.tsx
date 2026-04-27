import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { Search, Filter, ChevronRight } from "lucide-react";
import { RoleDropdown } from "./RoleDropdown";
import { TeamInvite } from "./TeamInvite";

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "badge-profit",
  PAID: "badge-brand",
  PAUSED: "badge-base",
  CANCELLED: "badge-base",
  EXPIRED: "badge-loss",
  REFUNDED: "badge-loss",
};

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const filter = searchParams.status?.toUpperCase();
  const filtered = allUsers.filter((u) => {
    if (!filter) return true;
    const sub = allSubscriptions.find((s) => s.userId === u.id);
    if (!sub) return false;
    if (filter === "ACTIVE") return sub.status === "ACTIVE" || sub.status === "PAID";
    return sub.status === filter;
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin · Mitglieder"
        title="Mitglieder"
        description={`${filtered.length} ${filter ? `· Filter: ${filter}` : "Mitglieder gesamt"}`}
        action={<TeamInvite />}
      />

      <div className="card-base mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Suche nach Name, E-Mail, Ablefy-ID…" />
        </div>
        <Link href="/admin/users" className={`btn-secondary ${!filter ? "border-brand text-brand" : ""}`}>Alle</Link>
        <Link href="/admin/users?status=active" className={`btn-secondary ${filter === "ACTIVE" ? "border-brand text-brand" : ""}`}>Aktiv</Link>
        <Link href="/admin/users?status=paused" className={`btn-secondary ${filter === "PAUSED" ? "border-brand text-brand" : ""}`}>Pausiert</Link>
        <Link href="/admin/users?status=expired" className={`btn-secondary ${filter === "EXPIRED" ? "border-brand text-brand" : ""}`}>Beendet</Link>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Mehr
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
            {filtered.map((u) => {
              const sub = allSubscriptions.find((s) => s.userId === u.id);
              return (
                <tr key={u.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/users/${u.id}` as never} className="hover:text-brand hover:underline">
                      {u.firstName} {u.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleDropdown initial={u.role} userId={u.id} />
                  </td>
                  <td className="px-4 py-3 text-xs">{sub?.productSlug ?? "—"}</td>
                  <td className="px-4 py-3">
                    {sub ? <span className={STATUS_CLASS[sub.status] ?? "badge-base"}>{sub.status}</span> : <span className="badge-base">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.loginCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.id}` as never}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                    >
                      Öffnen <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Klick auf Name oder „Öffnen" → vollständiges Profil mit Ablefy-Daten + Aktionsmenü (Sperren · Abmahnen · Upgrade auf „Bezahlt"-Status).
      </div>
    </>
  );
}
