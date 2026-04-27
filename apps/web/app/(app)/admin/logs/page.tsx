import { redirect } from "next/navigation";
import { Database, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { LogsTabs } from "./LogsTabs";

export const dynamic = "force-dynamic";

/**
 * Datenlogs — zentrale Protokoll-Sicht aller technischen Events.
 * Sichtbar nur fuer OWNER + ADMIN (sensible Daten: User-E-Mails, Push-Tokens, Webhook-Bodies).
 */
export default async function LogsPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Datenlogs"
        title="Datenlogs"
        description="Alle technischen Events in einem zentralen Protokoll. Filter pro Kanal, Suche, CSV-Export."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-brand" />
        <span>
          <strong className="text-brand">Vertraulich</strong> — diese Logs enthalten User-E-Mails, Push-Tokens und Webhook-Payloads. Sichtbar nur fuer OWNER + ADMIN.
        </span>
      </div>

      <div className="card-base p-1">
        <div className="border-b border-border bg-muted/40 px-3 py-2">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Database className="h-4 w-4 text-brand" /> Logs
          </h2>
        </div>
        <LogsTabs />
      </div>

      <div className="mt-6 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Phase 2: Logs werden aus einer dedizierten <code>events</code>-Tabelle gelesen (Postgres + 30-Tage-Retention),
        plus Cloudflare-R2-Archivierung fuer alles aelter als 30 Tage.
      </div>
    </>
  );
}
