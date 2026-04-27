"use client";
import { useRef, useState } from "react";
import { Send, AlertTriangle, ShieldCheck, ImagePlus, X } from "lucide-react";
import { filterText } from "@traderiq/api";
import type { Role } from "@traderiq/api";
import { SmileyPicker } from "./SmileyPicker";

interface CommunityComposerProps {
  placeholder?: string;
  contextHint?: string;
  /** Rolle des aktuell eingeloggten Users — entscheidet über das Upload-Limit. */
  userRole?: Role;
}

interface Attachment {
  id: string;
  name: string;
  /** data: URL für die Vorschau (Phase 1). Phase 2: Upload zu Cloudflare R2 / Vercel Blob. */
  dataUrl: string;
  size: number;
}

/**
 * Upload-Limit pro Beitrag/Kommentar:
 * - MEMBER:  max 5 Bilder
 * - alle anderen Rollen (MODERATOR/STAFF/ADMIN/OWNER): de-facto unlimited (50)
 */
function maxAttachmentsForRole(role?: Role): number {
  if (!role || role === "MEMBER") return 5;
  return 50;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Spec §10 + Iteration 8 (Foto-Upload):
 * - Beleidigungen werden mit Sternen maskiert + intern geflaggt.
 * - Werbung blockiert das Absenden komplett.
 * - Smiley-Picker mit den vom Spec erlaubten Reaktionen.
 * - Bis zu 4 Bilder pro Beitrag, je 5 MB max.
 */
export function CommunityComposer({ placeholder = "Was möchtest du teilen?", contextHint, userRole }: CommunityComposerProps) {
  const MAX_ATTACHMENTS = maxAttachmentsForRole(userRole);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "blocked"; reason: string }
    | { kind: "warning"; reason: string }
    | { kind: "ok" }
  >({ kind: "idle" });

  function insertEmoji(e: string) {
    setText((t) => `${t}${t.endsWith(" ") || t === "" ? "" : " "}${e} `);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (files.length > remaining) {
      setUploadError(`Maximal ${MAX_ATTACHMENTS} Bilder pro Beitrag.`);
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Nur Bilder sind erlaubt (PNG/JPG/WebP/HEIC).");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`„${file.name}" ist größer als 5 MB.`);
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;
    const result = filterText(text);
    if (result.blocked) {
      setStatus({
        kind: "blocked",
        reason:
          "Wir haben Hinweise auf Werbung für externe Produkte/Dienste oder verdächtige Links erkannt. Bitte überarbeite deinen Beitrag oder kontaktiere die Moderation.",
      });
      return;
    }
    if (result.flaggedProfanity.length > 0) {
      setText(result.cleaned);
      setStatus({
        kind: "warning",
        reason: `Beleidigungen wurden automatisch maskiert (${result.flaggedProfanity.length} Wort/e). Beitrag wurde abgesendet, die Moderation wurde informiert.`,
      });
      // Bei Warnung Bilder behalten, Text bleibt.
      return;
    }
    setStatus({ kind: "ok" });
    setText("");
    setAttachments([]);
  }

  return (
    <form onSubmit={submit} className="card-base p-4">
      {contextHint && <div className="mb-2 text-xs text-muted-foreground">{contextHint}</div>}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus({ kind: "idle" });
        }}
        placeholder={placeholder}
        rows={3}
        className="input-base h-auto min-h-[80px] resize-y"
      />

      {/* Bild-Vorschauen */}
      {attachments.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {attachments.map((a) => (
            <div key={a.id} className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAttachment(a.id)}
                aria-label={`Bild ${a.name} entfernen`}
                className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[10px] text-white">
                {a.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SmileyPicker onPick={insertEmoji} />

          {/* Bild-Upload-Button */}
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
            disabled={attachments.length >= MAX_ATTACHMENTS}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:opacity-50"
            aria-label="Bilder hinzufügen"
          >
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Foto / Screenshot</span>
            {attachments.length > 0 && (
              <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                {attachments.length}/{MAX_ATTACHMENTS}
              </span>
            )}
          </button>

          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Werbung wird blockiert · Beleidigungen maskiert · {MAX_ATTACHMENTS >= 50 ? "unbegrenzt Bilder" : `max ${MAX_ATTACHMENTS} Bilder`} (5 MB/Bild)
          </span>
        </div>
        <button
          type="submit"
          disabled={!text.trim() && attachments.length === 0}
          className="btn-brand inline-flex items-center gap-2"
        >
          <Send className="h-4 w-4" /> Posten
        </button>
      </div>

      {uploadError && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {status.kind === "blocked" && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{status.reason}</span>
        </div>
      )}
      {status.kind === "warning" && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{status.reason}</span>
        </div>
      )}
      {status.kind === "ok" && (
        <div className="mt-3 rounded-md border border-profit/40 bg-profit/5 p-3 text-xs text-profit">
          Beitrag wurde abgesendet (Demo: nur lokal). Push/Mail-Webhook wird in Phase 2 ausgelöst, Bild-Upload zu Cloudflare R2 / Vercel Blob.
        </div>
      )}
    </form>
  );
}
