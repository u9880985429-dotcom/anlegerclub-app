import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plug, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";
import { AblefyManager } from "./AblefyManager";
import { PricingOverviewCard } from "./PricingOverviewCard";
import { PendingBuyersCard } from "./PendingBuyersCard";

export const dynamic = "force-dynamic";

export default async function AblefyIntegrationPage() {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    redirect("/admin");
  }

  return (
    <>
      <div className="mb-3">
        <Link href="/admin/integrations" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Zurueck zu Integrationen
        </Link>
      </div>

      <PageHeader
        eyebrow="Admin · Integrationen"
        title="Ablefy"
        description="API-Zugang + Webhook-Empfang fuer Order-, Subscription- und Refund-Events. Basis fuer das KPI-Dashboard mit Echtdaten."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-brand" />
        <span>
          <strong className="text-brand">Vertraulich:</strong>{" "}
          API-Key/Secret werden in Phase 1 lokal im Browser-localStorage abgelegt + ein minimaler Cookie-Mirror nur fuers Webhook-Secret (damit der Server eingehende Webhooks signaturpruefen kann). Phase 2: AES-256-GCM-Vault in Postgres mit Audit-Log.
        </span>
      </div>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Plug className="h-4 w-4 text-brand" /> Konfiguration
        </h2>
        <AblefyManager />
      </section>

      <section className="mt-6">
        <PendingBuyersCard />
      </section>

      <section className="mt-6">
        <PricingOverviewCard />
      </section>
    </>
  );
}
