import { redirect } from "next/navigation";
import { ArrowLeftRight, RotateCcw, Mail, User as UserIcon, Hash } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { detectSwitchers, detectReactivations, type MatchStrategy } from "@/lib/anomaly-detection";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";
import { formatGermanDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "badge-profit",
  PAID: "badge-brand",
  PAUSED: "badge-base",
  CANCELLED: "badge-base",
  EXPIRED: "badge-loss",
  REFUNDED: "badge-loss",
};

const MATCH_LABEL: Record<MatchStrategy, string> = {
  user_id: "Gleiche User-ID",
  email: "Gleiche E-Mail",
  name: "Gleicher Name",
};

const MATCH_ICON: Record<MatchStrategy, React.ComponentType<{ className?: string }>> = {
  user_id: Hash,
  email: Mail,
  name: UserIcon,
};

/**
 * KPI - sonstige Daten — Wechsler & Re-Aktivierungen.
 * Vertraulich, nur OWNER + ADMIN.
 */
export default async function KpiSonstigeDatenPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const switchers = detectSwitchers(allUsers, allSubscriptions);
  const reactivations = detectReactivations(allUsers, allSubscriptions);

  return (
    <>
      <PageHeader
        eyebrow="Admin · KPI"
        title="KPI — sonstige Daten"
        description="Wechsler & Re-Aktivierungen. Findet Personen, die Produkt gewechselt haben oder nach einem beendeten Abo wieder aktiv sind — auch wenn sie sich mit einer zweiten User-ID neu eingetragen haben (Match per E-Mail oder Name)."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <span>
          <strong className="text-brand">Vertraulich:</strong>{" "}
          Nur Mitarbeiter mit Owner-/Admin-Rolle. Treffer werden anhand dreier Strategien gefunden:
          <span className="ml-1 inline-flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5"><Hash className="h-3 w-3" /> User-ID</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5"><Mail className="h-3 w-3" /> E-Mail</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5"><UserIcon className="h-3 w-3" /> Vor- + Nachname</span>
          </span>
        </span>
      </div>

      {/* Wechsler */}
      <section className="mb-8">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ArrowLeftRight className="h-4 w-4 text-brand" /> Wechsler ({switchers.length})
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Personen mit Subscriptions zu <strong>unterschiedlichen</strong> Produkten — z.B. von Trend zum All Access Pass aufgestiegen, oder von Cockpit zu Stillhalter gewechselt.
        </p>
        {switchers.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Keine Wechsler im aktuellen Datenbestand.
          </div>
        ) : (
          <div className="card-base overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2">Person</th>
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Pfad</th>
                  <th className="px-3 py-2">Subscriptions (chronologisch)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {switchers.map((sw) => {
                  const MatchIcon = MATCH_ICON[sw.matchStrategy];
                  return (
                    <tr key={sw.key} className="align-top">
                      <td className="px-3 py-2">
                        <div className="font-medium">{sw.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{sw.email}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
                          <MatchIcon className="h-3 w-3" /> {MATCH_LABEL[sw.matchStrategy]}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {sw.subs
                          .map((s) => PRODUCT_LABELS[s.productSlug] ?? s.productSlug)
                          .filter((label, i, arr) => i === 0 || arr[i - 1] !== label)
                          .join(" → ")}
                      </td>
                      <td className="px-3 py-2">
                        <ul className="space-y-1">
                          {sw.subs.map((s) => (
                            <li key={s.id} className="flex flex-wrap items-center gap-1.5">
                              <span className="font-medium">{PRODUCT_LABELS[s.productSlug] ?? s.productSlug}</span>
                              <span className={`badge-base ${STATUS_CLASS[s.status] ?? ""} text-[10px]`}>{s.status}</span>
                              <span className="text-[10px] text-muted-foreground">
                                Order: <span className="font-mono">{s.ablefyOrderId ?? "—"}</span>
                                {s.ablefyProductId && <> · Product-ID: <span className="font-mono">{s.ablefyProductId}</span></>}
                                {" · "}
                                seit {formatGermanDate(s.startedAt)}
                                {s.currentPeriodEnd && <> bis {formatGermanDate(s.currentPeriodEnd)}</>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Re-Aktivierungen */}
      <section className="mb-8">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <RotateCcw className="h-4 w-4 text-brand" /> Re-Aktivierungen ({reactivations.length})
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Personen mit zwei (oder mehr) Subscriptions zum <strong>gleichen</strong> Produkt — eine ist beendet (CANCELLED / EXPIRED / REFUNDED), die andere ist wieder aktiv (ACTIVE / PAID).
          Auch interessant, wenn dieselbe Person sich mit einer zweiten User-ID erneut registriert hat.
        </p>
        {reactivations.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Keine Re-Aktivierungen im aktuellen Datenbestand.
          </div>
        ) : (
          <div className="card-base overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2">Person</th>
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Produkt</th>
                  <th className="px-3 py-2">Alte Subs (beendet)</th>
                  <th className="px-3 py-2">Neue Subs (aktiv)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reactivations.map((re) => {
                  const MatchIcon = MATCH_ICON[re.matchStrategy];
                  return (
                    <tr key={re.key} className="align-top">
                      <td className="px-3 py-2">
                        <div className="font-medium">{re.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{re.email}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
                          <MatchIcon className="h-3 w-3" /> {MATCH_LABEL[re.matchStrategy]}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{PRODUCT_LABELS[re.productSlug] ?? re.productSlug}</td>
                      <td className="px-3 py-2">
                        <ul className="space-y-1">
                          {re.oldSubs.map((s) => (
                            <li key={s.id} className="flex flex-wrap items-center gap-1.5">
                              <span className={`badge-base ${STATUS_CLASS[s.status] ?? ""} text-[10px]`}>{s.status}</span>
                              <span className="text-[10px] text-muted-foreground">
                                Order: <span className="font-mono">{s.ablefyOrderId ?? "—"}</span>
                                {" · bis "}
                                {s.currentPeriodEnd ? formatGermanDate(s.currentPeriodEnd) : formatGermanDate(s.startedAt)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-2">
                        <ul className="space-y-1">
                          {re.newSubs.map((s) => (
                            <li key={s.id} className="flex flex-wrap items-center gap-1.5">
                              <span className={`badge-base ${STATUS_CLASS[s.status] ?? ""} text-[10px]`}>{s.status}</span>
                              <span className="text-[10px] text-muted-foreground">
                                Order: <span className="font-mono">{s.ablefyOrderId ?? "—"}</span>
                                {" · seit "}
                                {formatGermanDate(s.startedAt)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
