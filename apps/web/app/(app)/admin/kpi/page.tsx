import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { filterKpiRelevantSubs } from "@/modules/kpi";
import { KpiFilterBar } from "./KpiFilterBar";
import { DynamicGridLoader } from "./DynamicGridLoader";

export const dynamic = "force-dynamic";

/**
 * KPI-Dashboard — STRENG VERTRAULICH.
 * Sichtbar nur fuer OWNER und ADMIN.
 *
 * Phase 1: Dynamic Widget-Grid mit ~25 Chart-Typen aus der WIDGET_REGISTRY.
 *   User-Layout in localStorage gespeichert (ueberlebt Pushes).
 * Phase 2: Layout pro User in DB persistiert (geraete-uebergreifend).
 */
export default async function KpiDashboardPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Nur KPI-relevante Subs zaehlen: interne/Team-Mitglieder werden ausgefiltert
  // (konsistent mit PricingOverviewCard + anomaly-detection).
  const kpiSubs = filterKpiRelevantSubs(allSubscriptions, allUsers);
  const activeMembers = kpiSubs.filter((s) => s.status === "ACTIVE" || s.status === "PAID").length;
  const pausedMembers = kpiSubs.filter((s) => s.status === "PAUSED").length;
  const expiredMembers = kpiSubs.filter((s) => s.status === "EXPIRED" || s.status === "REFUNDED" || s.status === "CANCELLED").length;
  const totalUsers = allUsers.length;
  const avgArpu = 89;
  const newMembersThisMonth = 14;
  const churnedMembersThisMonth = 3;

  return (
    <>
      <PageHeader
        eyebrow="Admin · KPI"
        title="KPI-Dashboard"
        description="Vertraulich — nur OWNER + ADMIN. Frei zusammenstellbar aus 25+ Widgets."
      />

      <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-brand/40 bg-brand/5 px-3 py-2 text-xs">
        <Crown className="h-4 w-4 text-brand" />
        <span>
          <strong className="text-brand">Vertraulicher Bereich</strong> — sichtbar nur fuer{" "}
          <strong>OWNER</strong> und <strong>ADMIN</strong>. Andere Rollen sehen nicht einmal den Link in der Sidebar.
        </span>
      </div>

      {/* Filter-Bar */}
      <KpiFilterBar
        salesAgents={allUsers
          .filter((u) => u.role === "SALES" || u.role === "STAFF" || u.role === "ADMIN" || u.role === "OWNER")
          .map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, role: u.role }))}
      />

      {/* Dynamisches Widget-Grid */}
      <DynamicGridLoader
        baseData={{
          activeMembers,
          pausedMembers,
          expiredMembers,
          totalUsers,
          avgArpu,
          newMembersThisMonth,
          churnedMembersThisMonth,
        }}
      />
    </>
  );
}
