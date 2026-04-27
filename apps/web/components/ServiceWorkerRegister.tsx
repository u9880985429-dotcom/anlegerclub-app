"use client";
import { useEffect } from "react";

/**
 * Registriert den Service Worker für PWA-Install + Static-Asset-Caching.
 * Phase 2: erweitern um Push-Notifications-Setup (VAPID).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") {
      // Im Dev nicht registrieren um HMR nicht zu stören.
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent fail — PWA bleibt funktional, nur Caching/Install-Banner fehlt.
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}
