import { redirect } from "next/navigation";
import { Cookie, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { CookieManager } from "./CookieManager";

export const dynamic = "force-dynamic";

export default async function CookiesPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfiguration"
        title="Cookies & Einwilligungen"
        description="Cookie-Banner, Kategorien, eigene Cookies, Tracking-Codes pro Kategorie."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-brand" />
        <span>
          <strong className="text-brand">DSGVO-konform:</strong>{" "}
          Notwendige Cookies sind immer aktiv. Marketing- und Statistik-Cookies werden erst nach expliziter Einwilligung gesetzt. Alle Aenderungen werden im Audit-Log protokolliert.
        </span>
      </div>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Cookie className="h-4 w-4 text-brand" /> Konfiguration
        </h2>
        <CookieManager />
      </section>
    </>
  );
}
