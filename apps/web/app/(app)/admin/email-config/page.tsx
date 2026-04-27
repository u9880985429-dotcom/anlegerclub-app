import { redirect } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { SmtpForm } from "./SmtpForm";

export const dynamic = "force-dynamic";

/**
 * E-Mail-Konfiguration — eigener SMTP-Provider, Auto-Mail-Schalter, Header-Optionen.
 * Sichtbar nur fuer OWNER + ADMIN (Passwort + SMTP-Credentials).
 */
export default async function EmailConfigPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfiguration"
        title="E-Mail-Konfiguration"
        description="Eigener SMTP-Provider, Verhalten beim Mail-Versand, Header-Optionen."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-brand" />
        <span>
          <strong className="text-brand">SMTP-Credentials werden verschluesselt gespeichert.</strong>{" "}
          Phase 2: AES-256-GCM mit Per-Tenant-Master-Key, Audit-Eintrag bei jeder Aenderung.
        </span>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Mail className="h-4 w-4 text-brand" /> SMTP-Provider
        </h2>
        <SmtpForm />
      </section>
    </>
  );
}
