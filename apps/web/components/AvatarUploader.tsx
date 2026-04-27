"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { AVATAR_KEY } from "./Avatar";

interface AvatarUploaderProps {
  userId: string;
  name: string;
  isTeam?: boolean;
}

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

/**
 * Profilbild-Upload für alle Rollen.
 * Phase 1: Bild wird als data-URL in localStorage gespeichert (~3 MB nach Base64).
 * Phase 2: Upload zu Cloudflare R2 / Vercel Blob, URL wird per User-API persistiert.
 */
export function AvatarUploader({ userId, name, isTeam }: AvatarUploaderProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AVATAR_KEY(userId));
    if (stored) setAvatar(stored);
  }, [userId]);

  function broadcastChange(dataUrl: string | null) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("traderiq:avatar-change", { detail: { userId, dataUrl } }),
    );
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Nur Bilder sind erlaubt (PNG/JPG/WebP/HEIC).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Datei ist größer als 4 MB.");
      return;
    }
    setBusy(true);
    // Bild zu Quadrat skalieren via Canvas (max 512px) — spart Speicher und Initial-Latenz.
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 512;
        const canvas = document.createElement("canvas");
        canvas.width = max;
        canvas.height = max;
        const ctx = canvas.getContext("2d")!;
        // Center-Crop: kleinste Seite bestimmt Quadrat
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, max, max);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        try {
          window.localStorage.setItem(AVATAR_KEY(userId), dataUrl);
          setAvatar(dataUrl);
          broadcastChange(dataUrl);
          setError(null);
        } catch {
          setError("Speicher voll — Bild ist zu groß.");
        }
        setBusy(false);
      };
      img.onerror = () => {
        setError("Bild konnte nicht geladen werden.");
        setBusy(false);
      };
      img.src = String(reader.result);
    };
    reader.onerror = () => {
      setError("Datei konnte nicht gelesen werden.");
      setBusy(false);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  }

  function removeAvatar() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AVATAR_KEY(userId));
    setAvatar(null);
    broadcastChange(null);
  }

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className={`relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold ${
          avatar ? "" : isTeam ? "bg-brand text-white" : "bg-muted text-foreground"
        }`}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-brand inline-flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {avatar ? "Profilbild ändern" : "Profilbild hochladen"}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={removeAvatar}
              className="btn-secondary inline-flex items-center gap-2 text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Entfernen
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          PNG, JPG oder HEIC bis 4 MB. Wird automatisch auf 512×512 zugeschnitten.
          Phase 1: lokal im Browser gespeichert. Phase 2: Cloud-Upload mit DSGVO-Konsens.
        </p>
        {error && (
          <p className="mt-2 text-xs text-destructive">⚠️ {error}</p>
        )}
      </div>
    </div>
  );
}
