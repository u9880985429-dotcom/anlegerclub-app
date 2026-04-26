import Link from "next/link";
import { Users, CreditCard, TrendingUp, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { allSubscriptions, allTrades, allUsers, reports } from "@traderiq/api";

export default function AdminOverview() {
  const openReports = reports.filter((r) => r.status === "OPEN").length;
  const activeSubs = allSubscriptions.filter((s) => s.status === "ACTIVE").length;
  const pausedSubs = allSubscriptions.filter((s) => s.status === "PAUSED").length;

  return (
    <>
      <PageHeader eyebrow="Backend" title="Admin-Übersicht" description="CRUD auf Mock-Daten · Phase 2: persistiert in Postgres." />

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Mitglieder" value={String(allUsers.length)} icon={Users} href="/admin/users" />
        <Stat label="Aktive Abos" value={`${activeSubs}/${allSubscriptions.length}`} icon={CreditCard} href="/admin/subscriptions" />
        <Stat label="Trade-Signale" value={String(allTrades.length)} icon={TrendingUp} href="/admin/trades" />
        <Stat label="Offene Reports" value={String(openReports)} icon={AlertCircle} href="/admin/community" highlight={openReports > 0} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <QuickAction href="/admin/trades/new" title="Neuen Trade veröffentlichen" body="Triggert Push + Mail-Webhook automatisch." />
        <QuickAction href="/admin/community" title="Mod-Queue prüfen" body={`${openReports} offene Meldungen warten auf dich.`} />
        <QuickAction href="/admin/onboarding" title="Onboarding-Texte bearbeiten" body="Slides je Depot anpassen ohne Deploy." />
        <QuickAction href="/admin/pitch" title="Pitch-Modul bearbeiten" body="Headline, Body, CTA, Aktiv-Toggle." />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sub-Status-Verteilung</h2>
        <div className="card-base p-5">
          <div className="grid gap-3 sm:grid-cols-5">
            <StatusBox label="ACTIVE" count={activeSubs} className="text-profit" />
            <StatusBox label="PAUSED" count={pausedSubs} className="text-amber-400" />
            <StatusBox label="CANCELLED" count={allSubscriptions.filter((s) => s.status === "CANCELLED").length} />
            <StatusBox label="EXPIRED" count={allSubscriptions.filter((s) => s.status === "EXPIRED").length} className="text-loss" />
            <StatusBox label="REFUNDED" count={allSubscriptions.filter((s) => s.status === "REFUNDED").length} className="text-loss" />
          </div>
        </div>
      </section>
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
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md ${highlight ? "bg-amber-500/15 text-amber-400" : "bg-brand/15 text-brand"}`}>
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

function StatusBox({ label, count, className }: { label: string; count: number; className?: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/50 p-3 text-center">
      <div className={`text-2xl font-bold ${className ?? ""}`}>{count}</div>
      <div className="mt-0.5 text-[10px] font-mono uppercase text-muted-foreground">{label}</div>
    </div>
  );
}
