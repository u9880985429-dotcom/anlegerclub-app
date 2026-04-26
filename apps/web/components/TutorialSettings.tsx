"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCcw, Bell, BellOff } from "lucide-react";

const PRODUCT_LABELS = {
  starter: "Starter Depot",
  trend: "Trend Depot",
  stillhalter: "Stillhalter Depot",
  cockpit: "Trader Cockpit",
} as const;

interface TutorialSettingsProps {
  userId: string;
}

const AUTOSHOW_KEY = (uid: string) => `traderiq:tutorial:autoshow:${uid}`;
const SEEN_KEY_PREFIX = (uid: string) => `traderiq:tutorial:seen:${uid}:`;

export function TutorialSettings({ userId }: TutorialSettingsProps) {
  const [autoshow, setAutoshow] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(AUTOSHOW_KEY(userId));
    setAutoshow(v !== "0");
  }, [userId]);

  function setAuto(v: boolean) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTOSHOW_KEY(userId), v ? "1" : "0");
    setAutoshow(v);
  }

  function resetSeen() {
    if (typeof window === "undefined") return;
    const prefix = SEEN_KEY_PREFIX(userId);
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => window.localStorage.removeItem(k));
    setAuto(true);
  }

  if (!mounted) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {autoshow ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </div>
          <div>
            <div className="text-sm font-medium">Tutorial automatisch beim Erstlogin pro Depot zeigen</div>
            <div className="text-xs text-muted-foreground">
              {autoshow
                ? "Aktiv – beim ersten Besuch jedes Depots öffnet sich das Tutorial-Pop-up."
                : "Deaktiviert. Du erreichst das Tutorial weiterhin über den Button oben rechts."}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAuto(!autoshow)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition ${
            autoshow ? "border-brand bg-brand" : "border-border bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              autoshow ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {(["starter", "trend", "stillhalter", "cockpit"] as const).map((s) => (
          <Link
            key={s}
            href={`/onboarding/${s}` as never}
            className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-sm transition hover:border-brand/40"
          >
            <span>{PRODUCT_LABELS[s]} – Tutorial starten</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={resetSeen}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
      >
        <RefreshCcw className="h-3 w-3" />
        Auto-Pop-up zurücksetzen (für alle Depots erneut zeigen)
      </button>
    </div>
  );
}
