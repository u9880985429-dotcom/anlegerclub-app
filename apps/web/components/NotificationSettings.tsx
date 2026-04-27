"use client";
import { useEffect, useState } from "react";
import { Bell, Smartphone, Mail, Lock, Megaphone, MessageSquare, AtSign, MessageCircleReply, BellRing } from "lucide-react";

interface NotificationSettingsProps {
  userId: string;
  /** Welche Depots der User aboniert hat (für die Granular-Community-Toggles). */
  accessibleProducts: ("starter" | "trend" | "stillhalter" | "cockpit")[];
}

interface NotifPrefs {
  // Optionale Toggles (Default-Werte)
  channelPush: boolean;
  channelEmail: boolean;
  community: { starter: boolean; trend: boolean; stillhalter: boolean; cockpit: boolean };
  mentions: boolean;
  commentReplies: boolean;
  editorialAnnouncements: boolean;
}

const DEFAULTS: NotifPrefs = {
  channelPush: true,
  channelEmail: true,
  community: { starter: false, trend: false, stillhalter: false, cockpit: false },
  mentions: true,
  commentReplies: true,
  editorialAnnouncements: true,
};

const PRODUCT_LABEL = {
  starter: "Starter Depot",
  trend: "Trend Depot",
  stillhalter: "Stillhalter Depot",
  cockpit: "Trader Cockpit",
} as const;

const STORAGE_KEY = (uid: string) => `traderiq:notifs:${uid}`;

export function NotificationSettings({ userId, accessibleProducts }: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY(userId));
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotifPrefs>;
        setPrefs({ ...DEFAULTS, ...parsed, community: { ...DEFAULTS.community, ...(parsed.community ?? {}) } });
      }
    } catch {
      // Defaults bleiben erhalten
    }
  }, [userId]);

  function update(next: NotifPrefs) {
    setPrefs(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Channel-Toggles: Push + Mail */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <BellRing className="h-3.5 w-3.5" />
          Benachrichtigungs-Kanäle
        </h3>
        <div className="space-y-2">
          <ToggleRow
            icon={Smartphone}
            title="Push-Benachrichtigungen"
            description="Auf Handy + Desktop, sobald App / Browser geöffnet"
            enabled={prefs.channelPush}
            onChange={(v) => update({ ...prefs, channelPush: v })}
          />
          <ToggleRow
            icon={Mail}
            title="E-Mail-Benachrichtigungen"
            description="Parallel oder als Backup an deine E-Mail"
            enabled={prefs.channelEmail}
            onChange={(v) => update({ ...prefs, channelEmail: v })}
          />
        </div>
      </div>

      {/* Pflicht-Benachrichtigungen — immer an */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
          <Lock className="h-3.5 w-3.5" />
          Pflicht-Benachrichtigungen
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Diese Push-/Mail-Nachrichten erhältst du automatisch ab Beginn — sie sind elementarer Teil deines Anlegerclub-Zugangs und können nicht deaktiviert werden.
        </p>
        <div className="space-y-2">
          <LockedRow
            icon={Megaphone}
            title="Neue Trade-Signale"
            description="Sofort wenn die Redaktion einen neuen Trade veröffentlicht (Kauf, Verkauf, Stop-Anpassung, Take-Profit)"
          />
          <LockedRow
            icon={Megaphone}
            title="Neue Marktanalysen"
            description="Tagesblick · Wochenblick · Monatsblick · Perspektiven des Chefredakteurs"
          />
        </div>
      </div>

      {/* Optional — Community */}
      <div className="card-base p-5">
        <h3 className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          Community-Aktivität
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Optional: erhalte Benachrichtigungen, sobald in den jeweiligen Communities ein neuer Beitrag erscheint. Pro Depot getrennt steuerbar.
        </p>
        <div className="space-y-2">
          {accessibleProducts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              Du siehst die Community-Toggles erst, sobald du mindestens ein Depot abonnierst.
            </div>
          ) : (
            accessibleProducts.map((p) => (
              <ToggleRow
                key={p}
                icon={MessageSquare}
                title={`Neue Beiträge in ${PRODUCT_LABEL[p]}-Community`}
                description={`Push, sobald ein neues Community-Thema im ${PRODUCT_LABEL[p]} erscheint`}
                enabled={prefs.community[p]}
                onChange={(v) => update({ ...prefs, community: { ...prefs.community, [p]: v } })}
              />
            ))
          )}
        </div>
      </div>

      {/* Optional — Persönliche Erwähnungen */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <AtSign className="h-3.5 w-3.5" />
          Persönlich gerichtete Beiträge
        </h3>
        <div className="space-y-2">
          <ToggleRow
            icon={AtSign}
            title="Wenn ich erwähnt werde"
            description={'z.B. „@Michael S., was meinst du zu MCD?" — du erhältst sofort eine Push'}
            enabled={prefs.mentions}
            onChange={(v) => update({ ...prefs, mentions: v })}
          />
          <ToggleRow
            icon={MessageCircleReply}
            title="Antworten auf meine Kommentare"
            description="Push, wenn jemand auf deinen Kommentar antwortet"
            enabled={prefs.commentReplies}
            onChange={(v) => update({ ...prefs, commentReplies: v })}
          />
          <ToggleRow
            icon={Bell}
            title="Wichtige Redaktionsmeldungen"
            description="Wartung, Webinar-Reminder, Ankündigungen"
            enabled={prefs.editorialAnnouncements}
            onChange={(v) => update({ ...prefs, editorialAnnouncements: v })}
          />
        </div>
      </div>

      <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Phase 2: Push via Expo (FCM + APNs) und Mail via Webhook → Zapier/n8n. Auswahl wird in der DB pro User persistiert.
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-label={enabled ? `${title} deaktivieren` : `${title} aktivieren`}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition ${
          enabled ? "border-brand bg-brand" : "border-border bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function LockedRow({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-brand/30 bg-brand/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <span
        title="Pflicht-Benachrichtigung — kann nicht deaktiviert werden"
        className="inline-flex items-center gap-1 rounded-md bg-brand/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand"
      >
        <Lock className="h-3 w-3" /> Pflicht
      </span>
    </div>
  );
}
