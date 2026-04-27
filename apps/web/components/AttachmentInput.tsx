"use client";
import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import type { Role } from "@traderiq/api";

export interface Attachment {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function maxAttachmentsForRole(role?: Role): number {
  if (!role || role === "MEMBER") return 5;
  return 50;
}

interface AttachmentInputProps {
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  userRole?: Role;
  /** Eine externe Error-Setter-Funktion zum Anzeigen von Upload-Fehlern. */
  onError: (msg: string | null) => void;
  /** Visuell etwas kompakter im Reply-Form (kein Hint-Text). */
  compact?: boolean;
}

export function AttachmentInput({
  attachments,
  setAttachments,
  userRole,
  onError,
  compact,
}: AttachmentInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const max = maxAttachmentsForRole(userRole);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    onError(null);
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const remaining = max - attachments.length;
    if (files.length > remaining) {
      onError(max >= 50 ? "Zu viele Dateien gleichzeitig (max 50)." : `Maximal ${max} Bilder pro Beitrag.`);
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        onError("Nur Bilder sind erlaubt (PNG/JPG/WebP/HEIC).");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        onError(`„${file.name}" ist größer als 5 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setAttachments((prev) => [
          ...prev,
          { id: `att_${Date.now()}_${Math.random().toString(36).slice(2)}`, name: file.name, dataUrl, size: file.size },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      {attachments.length > 0 && (
        <div className={`mt-2 grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
          {attachments.map((a) => (
            <div key={a.id} className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAttachment(a.id)}
                aria-label={`Bild ${a.name} entfernen`}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={attachments.length >= max}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:opacity-50"
        aria-label="Bilder hinzufügen"
      >
        <ImagePlus className="h-4 w-4" />
        {!compact && <span className="hidden sm:inline">Foto / Screenshot</span>}
        {attachments.length > 0 && (
          <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">
            {attachments.length}{max >= 50 ? "" : `/${max}`}
          </span>
        )}
      </button>
    </>
  );
}
