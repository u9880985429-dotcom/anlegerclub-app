import { redirect } from "next/navigation";
import { Globe, Lock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { DomainManager } from "./DomainManager";
import { SslManager } from "./SslManager";

export const dynamic = "force-dynamic";

export default async function DomainsPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfiguration"
        title="Domains & SSL"
        description="Domain-Mapping inkl. optionaler IP-Zuordnung und SSL-Zertifikat-Management."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-loss/40 bg-loss/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-loss" />
        <span>
          <strong className="text-loss">Hochsensibel:</strong>{" "}
          Privater SSL-Schluessel verlaesst nie deinen Server unverschluesselt. In Phase 2: AES-256-GCM-Encryption mit Per-Tenant-Key,
          Audit-Eintrag bei jedem Lese-/Schreibzugriff, automatische Erinnerung 30 Tage vor Ablauf.
        </span>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Globe className="h-4 w-4 text-brand" /> Domain-Mapping
        </h2>
        <DomainManager />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-brand" /> SSL-Zertifikate
        </h2>
        <SslManager />
      </section>
    </>
  );
}
