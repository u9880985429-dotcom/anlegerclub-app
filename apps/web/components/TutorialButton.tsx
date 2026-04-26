"use client";
import { useState, useEffect } from "react";
import { GraduationCap, X, Play, EyeOff, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import type { ProductSlug } from "@traderiq/api";

interface TutorialButtonProps {
  activeDepot?: Exclude<ProductSlug, "all-access">;
  /** Stable user identifier for localStorage scoping. */
  userId: string;
  compact?: boolean;
}

const LABEL: Record<Exclude<ProductSlug, "all-access">, string> = {
  starter: "Starter Depot",
  trend: "Trend Depot",
  stillhalter: "Stillhalter Depot",
  cockpit: "Trader Cockpit",
};

const AUTOSHOW_KEY = (uid: string) => `traderiq:tutorial:autoshow:${uid}`;
const SEEN_KEY = (uid: string, slug: string) => `traderiq:tutorial:seen:${uid}:${slug}`;

/**
 * Tutorial-Button (Spec §7 + Iteration 3).
 * - Klein, sichtbar oben rechts auf jedem Depot/Cockpit (auch mobil).
 * - Beim Erstlogin pro Depot wird das Tutorial automatisch angeboten —
 *   AUSSER der User hat global "Nicht mehr anzeigen" gewählt.
 * - Re-Aktivierbar über die Einstellungen oder direkt im Tutorial-Popover.
 */
export function TutorialButton({ activeDepot, userId, compact }: TutorialButtonProps) {
  const [open, setOpen] = useState(false);
  const [autoshow, setAutoshow] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(AUTOSHOW_KEY(userId));
    setAutoshow(v !== "0");
  }, [userId]);

  useEffect(() => {
    if (!activeDepot || !mounted) return;
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(SEEN_KEY(userId, activeDepot));
    const globallyMuted = window.localStorage.getItem(AUTOSHOW_KEY(userId)) === "0";
    if (!seen && !globallyMuted) {
      setIsFirstVisit(true);
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
    if (seen) setIsFirstVisit(false);
  }, [activeDepot, userId, mounted]);

  if (!mounted) return null;

  function markSeen() {
    if (!activeDepot || typeof window === "undefined") return;
    window.localStorage.setItem(SEEN_KEY(userId, activeDepot), "1");
    setIsFirstVisit(false);
  }

  function dismissForever() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTOSHOW_KEY(userId), "0");
    setAutoshow(false);
    markSeen();
    setOpen(false);
  }

  function reEnable() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTOSHOW_KEY(userId), "1");
    setAutoshow(true);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) markSeen();
        }}
        className={`relative inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
          isFirstVisit
            ? "border-brand bg-brand/10 text-brand animate-pulse"
            : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-brand"
        }`}
        aria-label="Tutorial"
      >
        <GraduationCap className="h-4 w-4" />
        {!compact && <span>Tutorial</span>}
        {isFirstVisit && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-popover p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tutorial</h3>
            <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-accent">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {activeDepot ? (
            <Link
              href={`/onboarding/${activeDepot}` as never}
              className="btn-brand mb-3 inline-flex w-full items-center justify-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Play className="h-3.5 w-3.5" />
              {LABEL[activeDepot]}-Tutorial starten
            </Link>
          ) : (
            <div className="mb-3 grid gap-1.5">
              {(["starter", "trend", "stillhalter", "cockpit"] as const).map((s) => (
                <Link
                  key={s}
                  href={`/onboarding/${s}` as never}
                  className="btn-secondary inline-flex items-center justify-between gap-2"
                  onClick={() => setOpen(false)}
                >
                  <span>{LABEL[s]}</span>
                  <Play className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          )}

          {/* Auto-Show Toggle — beim Erstlogin pro Depot */}
          <div className="rounded-md border border-border bg-muted/40 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex-1">
                <span className="font-semibold text-foreground">
                  Bei Erstlogin pro Depot automatisch zeigen
                </span>
                <span className="mt-0.5 block text-muted-foreground">
                  Empfohlen für neue Mitglieder.
                </span>
              </span>
              <button
                type="button"
                onClick={() => (autoshow ? dismissForever() : reEnable())}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition ${
                  autoshow ? "border-brand bg-brand" : "border-border bg-muted"
                }`}
                aria-label={autoshow ? "Tutorial-Pop-up deaktivieren" : "Tutorial-Pop-up aktivieren"}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    autoshow ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {!autoshow && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <BellOff className="h-3 w-3" />
                Pop-up deaktiviert. Du kannst das Tutorial jederzeit hier oder in den Einstellungen wieder einschalten.
              </div>
            )}
            {autoshow && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Bell className="h-3 w-3" />
                Pop-up aktiv. Beim ersten Besuch jedes Depots öffnet sich das Tutorial automatisch.
              </div>
            )}
          </div>

          {autoshow && (
            <button
              type="button"
              onClick={dismissForever}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <EyeOff className="h-3 w-3" /> Nicht mehr anzeigen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
