"use client";
import { useEffect, useState } from "react";
import { cn } from "@traderiq/ui";

interface AvatarProps {
  /** Name für Initialen-Fallback. */
  name: string;
  /** User-ID — Schlüssel für lokal gespeichertes Profilbild. */
  userId?: string;
  /** Wird hervorgehoben (orange BG bei Team, grau bei Member). */
  isTeam?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-sm",
  lg: "h-16 w-16 text-base",
};

export const AVATAR_KEY = (userId: string) => `traderiq:avatar:${userId}`;

/**
 * User-Avatar mit Profilbild-Support.
 * Speichert Bilder in localStorage (Phase 1).
 * Phase 2: Upload zu Cloudflare R2, Wert wird über die Profil-API geliefert.
 *
 * Andere Komponenten können `useAvatar(userId)` direkt nutzen, um den
 * gespeicherten Daten-URL zu lesen.
 */
export function Avatar({ name, userId, isTeam, size = "md", className }: AvatarProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!userId || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AVATAR_KEY(userId));
    if (stored) setAvatar(stored);

    // Listen for changes to update avatar across mounted components
    function onStorage(e: StorageEvent) {
      if (e.key === AVATAR_KEY(userId!)) {
        setAvatar(e.newValue);
      }
    }
    function onCustomEvent(e: Event) {
      const detail = (e as CustomEvent<{ userId: string; dataUrl: string | null }>).detail;
      if (detail.userId === userId) setAvatar(detail.dataUrl);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("traderiq:avatar-change", onCustomEvent as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("traderiq:avatar-change", onCustomEvent as EventListener);
    };
  }, [userId]);

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const baseClasses = cn(
    "relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-bold",
    SIZE_CLASS[size],
    !avatar && (isTeam ? "bg-brand text-white" : "bg-muted text-foreground"),
    className,
  );

  // SSR + erste Render: Initialen anzeigen, sonst Hydration-Mismatch.
  if (!mounted || !avatar) {
    return <div className={baseClasses}>{initials}</div>;
  }

  return (
    <div className={baseClasses}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}
