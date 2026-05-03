import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { allUsers, allSubscriptions, canManagePermissions } from "@traderiq/api";
import { UserActionsMenu } from "./UserActionsMenu";
import { GranularPermissions } from "./GranularPermissions";
import { AblefyPlanLabel } from "@/components/AblefyPlanLabel";
import { requireSession } from "@/lib/access";
import { formatGermanDate } from "@/lib/format";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "badge-profit",
  PAID: "badge-brand",
  PAUSED: "badge-base",
  CANCELLED: "badge-base",
  EXPIRED: "badge-loss",
  REFUNDED: "badge-loss",
};

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const actorRole = session.user.role;
  const user = allUsers.find((u) => u.id === params.id);
  if (!user) notFound();
  const subs = allSubscriptions.filter((s) => s.userId === user.id);
  const canManagePerms = canManagePermissions(actorRole);

  return (
    <>
      <Link
        href="/admin/users"
        className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zur Mitglieder-Liste
      </Link>

      <PageHeader
        eyebrow="Admin · Mitglied"
        title={`${user.firstName} ${user.lastName}`}
        description={`${user.email} · Rolle ${user.role} · ${user.loginCount} Logins`}
        action={<UserActionsMenu userId={user.id} role={user.role} currentStatus={subs[0]?.status ?? "—"} actorRole={actorRole} />}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Profil */}
        <article className="card-base p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profil (Ablefy-Sync)</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field icon={Mail} label="E-Mail" value={user.email} />
            <Field icon={Phone} label="Telefon" value={user.phone ?? "—"} />
            <Field icon={MapPin} label="Anschrift" value={user.street ? `${user.street}, ${user.zip} ${user.city}, ${user.country}` : "—"} />
            <Field icon={Shield} label="Ablefy-ID" value={user.ablefyId ?? "—"} />
          </dl>
          {user.notes && (
            <div className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Interne Notiz:</strong> {user.notes}
            </div>
          )}
          <p className="mt-4 text-[11px] text-muted-foreground">
            Phase 2: Daten werden live aus Ablefy synchronisiert. Änderungen an Stamm­daten bitte direkt in Ablefy vornehmen.
          </p>
        </article>

        {/* Aktivität */}
        <article className="card-base p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Aktivität</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><dt>Logins gesamt</dt><dd className="font-mono">{user.loginCount}</dd></div>
            <div className="flex items-center justify-between"><dt>Onboarded für</dt><dd className="font-mono text-xs">{user.onboardedFor.join(", ") || "—"}</dd></div>
            <div className="flex items-center justify-between"><dt>Push aktiv</dt><dd>{user.notifyPush ? "✅" : "—"}</dd></div>
            <div className="flex items-center justify-between"><dt>Mail aktiv</dt><dd>{user.notifyEmail ? "✅" : "—"}</dd></div>
          </dl>
        </article>
      </section>

      {/* Subscriptions */}
      <section className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subscriptions</h3>
        <div className="card-base divide-y divide-border">
          {subs.length === 0 && <div className="p-5 text-sm text-muted-foreground">Keine Subscriptions.</div>}
          {subs.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-semibold">
                  {PRODUCT_LABELS[s.productSlug] ?? s.productSlug}
                  <AblefyPlanLabel ablefyProductId={s.ablefyProductId} />
                </div>
                <div className="text-xs text-muted-foreground">
                  Ablefy-Order: <span className="font-mono">{s.ablefyOrderId ?? "—"}</span>
                  {s.ablefyProductId && (
                    <> · Product-ID: <span className="font-mono">{s.ablefyProductId}</span></>
                  )}
                  {s.startedAt && <> · seit {formatGermanDate(s.startedAt)}</>}
                  {s.currentPeriodEnd && <> · läuft bis {formatGermanDate(s.currentPeriodEnd)}</>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={STATUS_CLASS[s.status] ?? "badge-base"}>{s.status}</span>
                <a
                  href="https://member.geldiq.com/account"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary inline-flex items-center gap-1"
                >
                  Bei Ablefy <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Granulare Bereichs-Berechtigungen — nur Owner/Admin */}
      {canManagePerms && (
        <section className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Bereichs-Berechtigungen (granular)
          </h3>
          <GranularPermissions userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
        </section>
      )}
    </>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="rounded-md border border-border bg-card px-3 py-2 text-sm">{value}</dd>
    </div>
  );
}
