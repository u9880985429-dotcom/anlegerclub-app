import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { TradeRow } from "@/components/TradeRow";
import { activeWelcomeText, PRODUCT_LABELS } from "@/lib/copy/login-status";
import {
  allPosts,
  allTrades,
  getNotificationsForUser,
  getPostsByCommunity,
  getCommunityBySlug,
  marketUpdates,
} from "@traderiq/api";
import { formatRelative } from "@/lib/format";
import { ArrowRight, Bell, MessageSquare, Newspaper, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions))!;
  const user = session.user;

  const recentTrades = [...allTrades]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4);

  const newSignals = recentTrades.filter(
    (t) => Date.parse(t.date) > Date.now() - 14 * 24 * 60 * 60 * 1000,
  ).length;

  const hauptdepotSlug = user.productSlug === "all-access" ? "trend" : user.productSlug;
  const hauptdepotLabel = PRODUCT_LABELS[hauptdepotSlug];

  const notifications = getNotificationsForUser(user.id).slice(0, 4);

  const communityHighlights = (() => {
    const slug = user.productSlug === "all-access" ? "trend" : user.productSlug;
    const c = getCommunityBySlug(slug);
    if (!c) return [];
    return getPostsByCommunity(c.id).slice(0, 3);
  })();

  const latestUpdate = marketUpdates[0]!;

  return (
    <>
      <PageHeader
        eyebrow={`Angemeldet als ${user.firstName}`}
        title={`Hallo ${user.firstName} 👋`}
        description={activeWelcomeText({
          vorname: user.firstName,
          newSignals: Math.max(newSignals, 1),
          hauptdepot: hauptdepotLabel,
        })}
      />

      {/* Quick stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Neue Signale" value={String(Math.max(newSignals, 1))} icon={TrendingUp} accent />
        <StatCard label="Ungelesen" value={String(notifications.filter((n) => !n.readAt).length)} icon={Bell} />
        <StatCard label="Posts heute" value="12" icon={MessageSquare} />
        <StatCard label="Marktupdates" value={String(marketUpdates.length)} icon={Newspaper} />
      </section>

      {/* Latest trades */}
      <section className="mt-8">
        <SectionTitle title="Neueste Trade-Signale" href={`/depot/${hauptdepotSlug}`} />
        <div className="space-y-4">
          {recentTrades.map((t) => (
            <TradeRow key={t.id} trade={t} />
          ))}
        </div>
      </section>

      {/* Two-column: notifications + community */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle title="Letzte Benachrichtigungen" href="/notifications" />
          <div className="card-base divide-y divide-border">
            {notifications.length === 0 && (
              <div className="p-5 text-sm text-muted-foreground">Keine neuen Benachrichtigungen.</div>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={(n.deeplink ?? "/notifications") as never}
                className="flex items-start gap-3 p-4 transition hover:bg-accent"
              >
                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${n.readAt ? "bg-muted-foreground/50" : "bg-brand"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="line-clamp-1 text-xs text-muted-foreground">{n.body}</div>
                </div>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground">{formatRelative(n.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Aus der Community" href={`/community/${hauptdepotSlug}`} />
          <div className="card-base divide-y divide-border">
            {communityHighlights.length === 0 && (
              <div className="p-5 text-sm text-muted-foreground">Noch keine Posts.</div>
            )}
            {communityHighlights.map((p) => (
              <Link
                key={p.id}
                href={`/community/${hauptdepotSlug}/post/${p.id}` as never}
                className="block p-4 transition hover:bg-accent"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{p.authorName}</span>
                  <span>·</span>
                  <span>{formatRelative(p.createdAt)}</span>
                  {p.pinned && <span className="badge-brand">📌 angepinnt</span>}
                </div>
                {p.title && <div className="text-sm font-semibold">{p.title}</div>}
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.bodyMd}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest market update */}
      <section className="mt-8">
        <SectionTitle title="Aktueller Marktblick" href="/depot/cockpit" />
        <article className="card-base p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="badge-brand">{latestUpdate.kind === "tag" ? "Tagesblick" : latestUpdate.kind === "woche" ? "Wochenblick" : "Monatsblick"}</span>
            <span>{formatRelative(latestUpdate.publishedAt)}</span>
          </div>
          <h3 className="text-lg font-semibold">{latestUpdate.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{latestUpdate.bodyMd}</p>
        </article>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="card-base p-5">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md ${accent ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {href && (
        <Link href={href as never} className="text-xs text-brand hover:underline inline-flex items-center gap-1">
          Alle ansehen <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
