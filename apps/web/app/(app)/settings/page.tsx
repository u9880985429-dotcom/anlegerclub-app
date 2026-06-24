import Link from "next/link";
import { ExternalLink, Shield, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TutorialSettings } from "@/components/TutorialSettings";
import { AvatarUploader } from "@/components/AvatarUploader";
import { NotificationSettings } from "@/components/NotificationSettings";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { requireSession } from "@/lib/access";
import { findSubscriptionsForUser, isTeamRole } from "@traderiq/api";
import type { ProductSlug } from "@traderiq/api";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";

export const dynamic = "force-dynamic";

// Rohe Enums in deutsche Klartext-Labels — ein Laie soll keine Grossbuchstaben-Codes lesen muessen.
const ROLE_LABELS: Record<string, string> = {
  OWNER: "Inhaber",
  ADMIN: "Administrator",
  STAFF: "Team",
  SALES: "Vertrieb",
  MEMBER: "Mitglied",
};
const SUB_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktiv",
  PAID: "Bezahlt",
  PAUSED: "Pausiert",
  EXPIRED: "Abgelaufen",
  CANCELLED: "Gekündigt",
  REFUNDED: "Erstattet",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const subs = findSubscriptionsForUser(session.user.id);

  return (
    <>
      <PageHeader eyebrow="Konto · Einstellungen" title="Einstellungen" description="Profil, Benachrichtigungen, Sicherheit & Abos." />

      {/* Profil */}
      <Section title="Profil">
        <div className="card-base mb-4 p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profilbild</h3>
          <AvatarUploader
            userId={session.user.id}
            name={`${session.user.firstName} ${session.user.lastName}`}
            isTeam={isTeamRole(session.user.role)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname" value={session.user.firstName} />
          <Field label="Nachname" value={session.user.lastName} />
          <Field label="E-Mail" value={session.user.email} />
          <Field label="Rolle" value={ROLE_LABELS[session.user.role] ?? session.user.role} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Deine Stammdaten verwaltest du bei Ablefy. Dein Profilbild bleibt hier bei dir.
        </p>
      </Section>

      {/* Benachrichtigungen */}
      <Section title="Benachrichtigungen">
        <NotificationSettings
          userId={session.user.id}
          accessibleProducts={accessibleProducts(session.user.productSlug, subs.map((s) => s.productSlug))}
        />
      </Section>

      {/* Sicherheit */}
      <Section title="Sicherheit">
        <div className="space-y-3 text-sm">
          <PasswordChangeForm />
        </div>
      </Section>

      {/* Subscriptions */}
      <Section title="Abos & Zahlungen">
        <div className="card-base divide-y divide-border">
          {subs.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine aktiven Abos.</div>}
          {subs.map((s) => {
            const statusBadge =
              s.status === "ACTIVE"
                ? "badge-profit"
                : s.status === "PAUSED"
                ? "badge-base"
                : "badge-loss";
            return (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{PRODUCT_LABELS[s.productSlug]}</div>
                  <div className="text-xs text-muted-foreground">
                    Ablefy-Order: <span className="font-mono">{s.ablefyOrderId ?? "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusBadge}>{SUB_STATUS_LABELS[s.status] ?? s.status}</span>
                  <a
                    href="https://myablefy.com/payer/orders"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    Bei Ablefy verwalten <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Deine Kündigung läuft über Ablefy.
        </p>
      </Section>

      {/* Onboarding repeat */}
      <Section title="Tutorial erneut ansehen">
        <TutorialSettings userId={`${session.user.firstName}${session.user.lastName}`} />
      </Section>

      <Section title="Rechtliches">
        <div className="space-y-2 text-sm">
          <Row icon={Shield} title="AGB" subtitle="Unsere Allgemeinen Geschäftsbedingungen" />
          <Row icon={Shield} title="Datenschutzerklärung" subtitle="Deine Daten werden in der EU gespeichert (Frankfurt)" />
          <Row icon={Shield} title="Impressum" />
          <Row icon={Shield} title={'Disclaimer „keine Anlageberatung“'} subtitle="Hinweis bei jedem Onboarding" />
        </div>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="rounded-md border border-border bg-card px-3 py-2 text-sm">{value}</div>
    </div>
  );
}

function accessibleProducts(
  primary: ProductSlug,
  subSlugs: string[],
): ("starter" | "trend" | "stillhalter" | "cockpit")[] {
  const all: ("starter" | "trend" | "stillhalter" | "cockpit")[] = ["starter", "trend", "stillhalter", "cockpit"];
  if (primary === "all-access" || subSlugs.includes("all-access")) return all;
  return all.filter((p) => primary === p || subSlugs.includes(p));
}

function Row({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
