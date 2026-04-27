import { redirect } from "next/navigation";
import { Key, Webhook, Puzzle, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";
import { ApiKeysSection } from "./ApiKeysSection";
import { WebhooksSection } from "./WebhooksSection";
import { PluginsSection } from "./PluginsSection";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Integrationen"
        title="API · Webhooks · Plugins"
        description="Externe Anbindungen verwalten — z. B. Ablefy-Sync, Mail-Versand, Push-Provider, ITler-API-Zugang."
      />

      <div className="mb-6 rounded-md border border-brand/30 bg-brand/5 p-4 text-xs text-foreground">
        <div className="mb-1 inline-flex items-center gap-1.5 font-semibold text-brand">
          <Lock className="h-3.5 w-3.5" /> Eingeschränkter Zugriff
        </div>
        Nur OWNER und ADMIN haben Zugriff auf API-Keys, Webhooks und Plugins. Aktionen werden im Audit-Log protokolliert.
      </div>

      <section className="mb-10">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Key className="h-4 w-4" /> API-Keys
        </h2>
        <ApiKeysSection />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Webhook className="h-4 w-4" /> Webhooks
        </h2>
        <WebhooksSection />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Puzzle className="h-4 w-4" /> Plugins
        </h2>
        <PluginsSection />
      </section>
    </>
  );
}
