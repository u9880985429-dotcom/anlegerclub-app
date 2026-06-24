import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allUsers, canInviteTeam } from "@traderiq/api";
import { Search, Filter, ChevronRight, Mail, Database } from "lucide-react";
import { RoleDropdown } from "./RoleDropdown";
import { TeamInvite } from "./TeamInvite";
import { requireSession } from "@/lib/access";
import { listCustomers, listSubsByCustomerEmails, type Customer, type CustomerSubscription } from "@/modules/customers";
import { isSupabaseConfigured } from "@/lib/supabase";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";
import { InviteCustomerButton } from "./InviteCustomerButton";

export const dynamic = "force-dynamic";

const STATUS_CLASS_MOCK: Record<string, string> = {
  ACTIVE: "badge-profit",
  PAID: "badge-brand",
  PAUSED: "badge-base",
  CANCELLED: "badge-base",
  EXPIRED: "badge-loss",
  REFUNDED: "badge-loss",
};

const STATUS_CLASS_DB: Record<string, string> = {
  active: "badge-profit",
  paid: "badge-brand",
  paused: "badge-base",
  cancelled: "badge-base",
  expired: "badge-loss",
  refunded: "badge-loss",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await requireSession();
  const actorRole = session.user.role;
  const filter = searchParams.status?.toLowerCase();

  // ─── Mock-User (Andrei / Max / Babsi / Hendrik — login-faehig) ────────
  const mockFiltered = allUsers.filter((u) => {
    if (!filter || filter === "all") return true;
    const sub = allSubscriptions.find((s) => s.userId === u.id);
    if (!sub) return false;
    const subStatus = sub.status.toLowerCase();
    if (filter === "active") return subStatus === "active" || subStatus === "paid";
    return subStatus === filter;
  });

  // ─── Echte Customers aus Supabase (sichtbar im Admin, NICHT login-faehig) ──
  const dbStatusFilter = filter === "active" || filter === "paused" || filter === "expired" || filter === "all"
    ? (filter === "all" ? undefined : filter as "active" | "paused" | "expired")
    : undefined;
  const customers = await listCustomers({ status: filter === "blocked" ? "blocked" : "all" });
  const customerEmails = customers.map((c) => c.email);
  const customerSubs = await listSubsByCustomerEmails(customerEmails);
  const subsByEmail = new Map<string, CustomerSubscription[]>();
  for (const s of customerSubs) {
    const list = subsByEmail.get(s.customerEmail) ?? [];
    list.push(s);
    subsByEmail.set(s.customerEmail, list);
  }

  // Filter auf Customer-Subs anwenden
  const customersFiltered = customers.filter((c) => {
    if (!filter || filter === "all") return true;
    const subs = subsByEmail.get(c.email) ?? [];
    if (filter === "active") return subs.some((s) => s.status === "active" || s.status === "paid");
    return subs.some((s) => s.status === filter);
  });

  const totalCount = mockFiltered.length + customersFiltered.length;

  return (
    <>
      <PageHeader
        eyebrow="Admin · Mitglieder"
        title="Mitglieder"
        description={
          isSupabaseConfigured()
            ? `${totalCount} ${filter && filter !== "all" ? `· Filter: ${filter}` : "Mitglieder gesamt"} (${mockFiltered.length} intern + ${customersFiltered.length} aus Ablefy)`
            : `${mockFiltered.length} ${filter && filter !== "all" ? `· Filter: ${filter}` : "Mitglieder gesamt"} · Supabase nicht angebunden`
        }
        action={canInviteTeam(actorRole) ? <TeamInvite /> : undefined}
      />

      <div className="card-base mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Suche nach Name, E-Mail, Ablefy-ID…" />
        </div>
        <Link href="/admin/users" className={`btn-secondary ${!filter || filter === "all" ? "border-brand text-brand" : ""}`}>Alle</Link>
        <Link href="/admin/users?status=active" className={`btn-secondary ${filter === "active" ? "border-brand text-brand" : ""}`}>Aktiv</Link>
        <Link href="/admin/users?status=paused" className={`btn-secondary ${filter === "paused" ? "border-brand text-brand" : ""}`}>Pausiert</Link>
        <Link href="/admin/users?status=cancelled" className={`btn-secondary ${filter === "cancelled" ? "border-brand text-brand" : ""}`}>Storniert</Link>
        <Link href="/admin/users?status=expired" className={`btn-secondary ${filter === "expired" ? "border-brand text-brand" : ""}`}>Beendet</Link>
        <Link href="/admin/users?status=refunded" className={`btn-secondary ${filter === "refunded" ? "border-brand text-brand" : ""}`}>Erstattet</Link>
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
              <th className="px-4 py-3">Rolle / Quelle</th>
              <th className="px-4 py-3">Produkt</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Logins</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Mock-User (Owner / Admin / Test-Member) */}
            {mockFiltered.map((u) => {
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
                    <RoleDropdown initial={u.role} userId={u.id} actorRole={actorRole} />
                  </td>
                  <td className="px-4 py-3 text-xs">{sub ? PRODUCT_LABELS[sub.productSlug] ?? sub.productSlug : "—"}</td>
                  <td className="px-4 py-3">
                    {sub ? <span className={STATUS_CLASS_MOCK[sub.status] ?? "badge-base"}>{sub.status}</span> : <span className="badge-base">—</span>}
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

            {/* Echte Customers aus Supabase */}
            {customersFiltered.map((c) => {
              const subs = subsByEmail.get(c.email) ?? [];
              // Hauptsub: bevorzugt aktiv, sonst neueste
              const activeSub = subs.find((s) => s.status === "active" || s.status === "paid") ?? subs[0] ?? null;
              const productLabel = activeSub
                ? (PRODUCT_LABELS[activeSub.productSlug as keyof typeof PRODUCT_LABELS] ?? activeSub.productSlug)
                : "—";
              const planLabel = activeSub?.planLabel;
              return (
                <tr key={`db_${c.email}`} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">
                    {c.firstName ?? c.lastName ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() : <span className="text-muted-foreground italic">(kein Name)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs" title="Echter Kunde aus Ablefy. Login-Flow kommt in Sprint A.">
                      <Database className="h-3 w-3" /> Ablefy
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {productLabel}
                    {planLabel && <div className="text-xs text-muted-foreground">{planLabel}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {activeSub ? (
                      <span className={STATUS_CLASS_DB[activeSub.status] ?? "badge-base"}>{activeSub.status}</span>
                    ) : (
                      <span className="badge-base">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title="Login-Faehigkeit fuer Ablefy-Kunden kommt in Sprint A (Auto-User-Anlage + Passwort-Vergabe-Flow)">—</td>
                  <td className="px-4 py-3 text-right">
                    <InviteCustomerButton email={c.email} firstName={c.firstName} />
                  </td>
                </tr>
              );
            })}

            {totalCount === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {filter && filter !== "all"
                    ? `Keine Mitglieder mit Status "${filter}".`
                    : isSupabaseConfigured()
                      ? "Noch keine Kunden in der Datenbank. Klick auf /admin/integrations/ablefy → 'Sync ausfuehren', um Bestandsdaten aus Ablefy zu laden."
                      : "Supabase noch nicht angebunden."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        <div>
          🛈 <strong>Hinweis:</strong> Mock-Mitglieder (Andrei / Max / Babsi / Hendrik) sind login-faehig. Echte Ablefy-Kunden sind sichtbar, aber Login-Flow folgt in Sprint A.
        </div>
        <div>
          Klick auf Mock-Namen → vollständiges Profil. Bei Ablefy-Kunden: „Einladen"-Knopf öffnet vorgefertigte Mail an die Kunden-E-Mail.
        </div>
      </div>
    </>
  );
}
