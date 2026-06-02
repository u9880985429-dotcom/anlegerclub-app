import Link from "next/link";
import { Users, AlertTriangle, TrendingUp, FileText, ChevronRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allTrades, allUsers, reports } from "@traderiq/api";

export default function AdminOverview() {
  const activeMembers = allSubscriptions.filter((s) => s.status === "ACTIVE" || s.status === "PAID").length;
  const pausedSubs = allSubscriptions.filter((s) => s.status === "PAUSED");
  const openReports = reports.filter((r) => r.status === "OPEN").length;

  const paymentProblemUsers = pausedSubs.map((s) => {
    const u = allUsers.find((u) => u.id === s.userId);
    return { sub: s, user: u };
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin · Übersicht"
        title="Admin-Übersicht"
        description="Zentrale Steuerung. Inhalte werden direkt im jeweiligen Depot via Bearbeitungsmodus gepflegt."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Aktive Mitglieder" value={String(activeMembers)} icon={Users} href="/admin/users?status=active" />
        <Stat
          label="Mitglieder mit Zahlungsschwierigkeiten"
          value={String(pausedSubs.length)}
          icon={AlertTriangle}
          href="/admin/users?status=paused"
          highlight={pausedSubs.length > 0}
        />
        <Stat label="Trade-Signale gesamt" value={String(allTrades.length)} icon={TrendingUp} href="/admin/users" />
        <Stat label="Offene Reports" value={String(openReports)} icon={FileText} href="/admin/community" highlight={openReports > 0} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          Mitglieder mit Zahlungsschwierigkeiten ({pausedSubs.length})
        </h2>
        <div className="card-base divide-y divide-border">
          {paymentProblemUsers.length === 0 && (
            <div className="p-5 text-sm text-muted-foreground">Keine offenen Fälle. ✅</div>
          )}
          {paymentProblemUsers.map(({ sub, user }) => (
            <div key={sub.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.email} · Produkt <span className="badge-base">{sub.productSlug}</span>
                  {sub.pausedReason && <> · Grund: <code className="font-mono text-xs">{sub.pausedReason}</code></>}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link href={`/admin/users/${user?.id}` as never} className="btn-secondary inline-flex items-center gap-1">
                  Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="https://member.geldiq.com/account"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-brand inline-flex items-center gap-1"
                >
                  Ablefy <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <QuickAction href="/admin/community" title="Mod-Queue prüfen" body={`${openReports} offene Meldungen warten auf dich.`} />
        <QuickAction href="/admin/subscriptions" title="Neue Subscription / Einladung versenden" body="Mail an Kunden senden oder Ablefy-Link kopieren." />
        <QuickAction href="/admin/users" title="Mitglieder-Verwaltung" body="Status, Rollen, Aktionen, vollständige Profilansicht." />
        <QuickAction href="/admin/audit" title="Audit-Log" body="Wer · Was · Wann · Warum." />
      </section>

      <div className="mt-8 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        💡 <strong>Tipp:</strong> Trade-Signale, Depotauswertungen, Aktie im Fokus, Marktupdates, Lexikon und Videos werden direkt im jeweiligen Depot via{" "}
        <strong>Bearbeitungsmodus</strong> gepflegt – nicht hier im Admin-Backend.
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  href,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href as never} className={`card-base block p-5 transition hover:border-brand/40 ${highlight ? "border-amber-500/40" : ""}`}>
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md ${highlight ? "bg-amber-500/15 text-amber-700" : "bg-brand/15 text-brand"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}

function QuickAction({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href as never} className="card-base flex items-center justify-between p-5 transition hover:border-brand/40">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{body}</div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
