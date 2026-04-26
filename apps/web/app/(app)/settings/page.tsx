import Link from "next/link";
import { ExternalLink, Mail, Bell, Smartphone, Shield, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { findSubscriptionsForUser } from "@traderiq/api";
import { PRODUCT_LABELS, PRODUCT_LINKS } from "@/lib/copy/login-status";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const subs = findSubscriptionsForUser(session.user.id);

  return (
    <>
      <PageHeader eyebrow="Konto" title="Einstellungen" description="Profil, Benachrichtigungen, Sicherheit & Abos." />

      {/* Profil */}
      <Section title="Profil">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname" value={session.user.firstName} />
          <Field label="Nachname" value={session.user.lastName} />
          <Field label="E-Mail" value={session.user.email} />
          <Field label="Rolle" value={session.user.role} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Profildaten werden in Phase 2 mit Ablefy synchronisiert. Änderungen dort wirken sich automatisch hier aus.
        </p>
      </Section>

      {/* Benachrichtigungen */}
      <Section title="Benachrichtigungen">
        <div className="space-y-1">
          <ToggleRow icon={Smartphone} title="Push-Benachrichtigungen" description="Trades, Auswertungen, Erwähnungen" enabled />
          <ToggleRow icon={Mail} title="E-Mail-Benachrichtigungen" description="Trades, Auswertungen, wichtige Redaktionsmeldungen" enabled />
          <ToggleRow icon={Bell} title="Community-Erwähnungen" description="Push, wenn dich jemand mit @ erwähnt" enabled />
        </div>
        <div className="mt-4 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          Phase 2: granulare Steuerung pro Depot (z. B. nur Trend-Trades, keine Stillhalter-Push).
        </div>
      </Section>

      {/* Sicherheit */}
      <Section title="Sicherheit">
        <div className="space-y-2 text-sm">
          <Row icon={Shield} title="Passwort ändern" subtitle="Zuletzt geändert: vor 47 Tagen" />
          <Row icon={Smartphone} title="2-Faktor-Authentifizierung (SMS-OTP)" subtitle="Phase 2: Twilio Verify" />
          <Row icon={Shield} title="Aktive Sitzungen" subtitle="2 Geräte aktiv" />
        </div>
      </Section>

      {/* Subscriptions */}
      <Section title="Abos & Zahlungen">
        <div className="card-base divide-y divide-border">
          {subs.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine aktiven Abos.</div>}
          {subs.map((s) => {
            const link = PRODUCT_LINKS.find((l) => l.slug === s.productSlug);
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
                  <span className={statusBadge}>{s.status}</span>
                  {link && (
                    <a href={link.url} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
                      Bei Ablefy verwalten <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Kündigung läuft ausschließlich über Ablefy (Phase 2: Deeplink direkt zur Subscription).
        </p>
      </Section>

      {/* Onboarding repeat */}
      <Section title="Tutorial erneut ansehen">
        <div className="grid gap-2 sm:grid-cols-2">
          {(["starter", "trend", "stillhalter", "cockpit"] as const).map((s) => (
            <Link
              key={s}
              href={`/onboarding/${s}` as never}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-sm transition hover:border-brand/40"
            >
              <span>{PRODUCT_LABELS[s]} – Tutorial</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Rechtliches">
        <div className="space-y-2 text-sm">
          <Row icon={Shield} title="AGB" subtitle="Texte vom Kunden geliefert (Spec §15)" />
          <Row icon={Shield} title="Datenschutzerklärung" subtitle="EU-Hosting (Vercel Frankfurt)" />
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

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border ${
          enabled ? "border-brand bg-brand" : "border-border bg-muted"
        }`}
        title="Phase 2: persistiert in DB"
      >
        <span
          className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );
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
