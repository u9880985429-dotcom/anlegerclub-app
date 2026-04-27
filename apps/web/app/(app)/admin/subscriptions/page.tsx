import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { formatGermanDate } from "@/lib/format";
import { InviteCard } from "./InviteCard";

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "badge-profit",
  PAID: "badge-brand",
  PAUSED: "badge-base",
  CANCELLED: "badge-base",
  EXPIRED: "badge-loss",
  REFUNDED: "badge-loss",
};

const PRODUCT_INVITES: { slug: string; label: string; url: string }[] = [
  { slug: "starter", label: "Starter Depot", url: "https://member.geldiq.com/s/geldiq/starter-depot-8740b018" },
  { slug: "trend", label: "Trend Depot", url: "https://member.geldiq.com/s/geldiq/trend-depot-c8b71c4e" },
  { slug: "stillhalter", label: "Stillhalter Depot", url: "https://member.geldiq.com/s/geldiq/stillhalter-depot" },
  { slug: "cockpit", label: "Trader Cockpit", url: "https://member.geldiq.com/s/geldiq/trader-cockpit" },
  { slug: "all-access", label: "Trader IQ All Access Pass", url: "https://member.geldiq.com/s/geldiq/trader-iq-anlegerclub-ba83613f" },
];

export default function AdminSubscriptionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Subscriptions & Einladungen"
        title="Subscriptions & Einladungen"
        description="Bestehende Abos und Einladungen für neue Kunden – per Mail oder über Direkt-Link."
      />

      {/* Einladungs-Modus */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Neue Einladung versenden
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {PRODUCT_INVITES.map((p) => (
          <InviteCard key={p.slug} slug={p.slug} label={p.label} url={p.url} />
        ))}
      </div>

      {/* Bestehende Subs */}
      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Bestehende Subscriptions
      </h2>
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
              return (
                <tr key={s.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">{user?.firstName} {user?.lastName}</td>
                  <td className="px-4 py-3">
                    <span className="badge-brand font-mono">{s.productSlug}</span>
                  </td>
                  <td className="px-4 py-3"><span className={STATUS_CLASS[s.status] ?? "badge-base"}>{s.status}</span></td>
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
        Phase 2: Outlook-OAuth-Anbindung für direkten Mail-Versand aus dem Admin (info@traderiq.net) inkl. Signatur-Vorlagen.
      </div>
    </>
  );
}
