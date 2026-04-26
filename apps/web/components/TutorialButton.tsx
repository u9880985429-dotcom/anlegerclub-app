"use client";
import { useState, useEffect } from "react";
import { GraduationCap, X, Play } from "lucide-react";
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

/**
 * Spec: Tutorial-Button oben rechts. Schiebe-Toggle "Tutorial erneut ansehen".
 * Beim Erstlogin pro Depot wird der Onboarding-Slider automatisch angeboten
 * (Pulsing-Indikator).
 */
export function TutorialButton({ activeDepot, userId, compact }: TutorialButtonProps) {
  const [open, setOpen] = useState(false);
  const [autoReplay, setAutoReplay] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeDepot) return;
    if (typeof window === "undefined") return;
    const key = `traderiq:onboarded:${userId}:${activeDepot}`;
    const seen = window.localStorage.getItem(key);
    if (!seen) {
      setIsFirstVisit(true);
      // Erstlogin pro Depot → Tutorial automatisch nach 800 ms anbieten
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
    setAutoReplay(window.localStorage.getItem(`traderiq:autoreplay:${userId}`) === "1");
  }, [activeDepot, userId]);

  if (!mounted) return null;

  function markSeen() {
    if (!activeDepot) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`traderiq:onboarded:${userId}:${activeDepot}`, "1");
    setIsFirstVisit(false);
  }

  function toggleAutoReplay(v: boolean) {
    setAutoReplay(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`traderiq:autoreplay:${userId}`, v ? "1" : "0");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          markSeen();
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
        {isFirstVisit && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-4 shadow-lg">
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

          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 p-3 text-xs">
            <span className="flex-1">
              <span className="font-semibold text-foreground">Tutorial automatisch wiederholen</span>
              <span className="mt-0.5 block text-muted-foreground">Bei jedem Erstlogin pro Depot</span>
            </span>
            <button
              type="button"
              onClick={() => toggleAutoReplay(!autoReplay)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border ${
                autoReplay ? "border-brand bg-brand" : "border-border bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  autoReplay ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>
      )}
    </div>
  );
}
