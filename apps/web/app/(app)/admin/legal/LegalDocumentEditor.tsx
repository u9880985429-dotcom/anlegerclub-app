"use client";
import { useEffect, useRef, useState } from "react";
import {
  FileText, Upload, FileType, Trash2, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2,
  Download,
} from "lucide-react";
import { LEGAL_DOCS, type LegalSlug } from "./legal-docs";

interface LegalDocument {
  text: string;
  fileName: string | null;
  fileType: string | null;
  fileDataUrl: string | null;
  fileSize: number;
  updatedAt: string;
}

const STORAGE_KEY = (slug: LegalSlug) => `traderiq:legal:${slug}`;

export function LegalDocumentEditor({ slug }: { slug: LegalSlug }) {
  const meta = LEGAL_DOCS[slug];
  const [doc, setDoc] = useState<LegalDocument>({
    text: "",
    fileName: null,
    fileType: null,
    fileDataUrl: null,
    fileSize: 0,
    updatedAt: "",
  });
  const [mounted, setMounted] = useState(false);
  const [textPreview, setTextPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY(slug));
      if (raw) setDoc(JSON.parse(raw));
    } catch {}
  }, [slug]);

  function persist(next: LegalDocument) {
    setDoc(next);
    localStorage.setItem(STORAGE_KEY(slug), JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveText() {
    persist({ ...doc, updatedAt: new Date().toISOString() });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["pdf", "doc", "docx"];
    if (!allowed.includes(file.type) && !(ext && allowedExt.includes(ext))) {
      setUploadError("Bitte nur PDF (.pdf) oder Word (.doc, .docx) hochladen.");
      e.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Datei zu gross (max. 8 MB).");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setUploading(false);

    persist({
      ...doc,
      fileName: file.name,
      fileType: file.type || `application/${ext}`,
      fileDataUrl: dataUrl,
      fileSize: file.size,
      updatedAt: new Date().toISOString(),
    });
    e.target.value = "";
  }

  function removeFile() {
    if (!confirm("Hochgeladene Datei wirklich entfernen?")) return;
    persist({ ...doc, fileName: null, fileType: null, fileDataUrl: null, fileSize: 0, updatedAt: new Date().toISOString() });
  }

  function downloadFile() {
    if (!doc.fileDataUrl || !doc.fileName) return;
    const a = document.createElement("a");
    a.href = doc.fileDataUrl;
    a.download = doc.fileName;
    a.click();
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Datei-Upload */}
      <div className="card-base p-5">
        <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
          <FileType className="h-4 w-4 text-brand" /> Datei (PDF oder Word)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Optional: lade eine vorbereitete PDF oder Word-Datei hoch (max. 8 MB). Falls hochgeladen, wird sie aus dem Footer der App zum Download angeboten.
        </p>

        {doc.fileName ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
            <div className="min-w-0 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{doc.fileName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {(doc.fileSize / 1024).toFixed(1)} KB · hochgeladen {new Date(doc.updatedAt).toLocaleString("de-DE")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={downloadFile} className="btn-ghost inline-flex items-center gap-1 text-xs" aria-label="Herunterladen">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-secondary inline-flex items-center gap-1 text-xs">
                <Upload className="h-3.5 w-3.5" /> Ersetzen
              </button>
              <button onClick={removeFile} className="btn-ghost text-destructive" aria-label="Datei entfernen">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/10 p-6 text-xs text-muted-foreground transition hover:border-brand/40 hover:bg-brand/5"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
            <span>
              <strong className="text-foreground">Klick hier oder ziehe Datei rein</strong> — PDF, DOC oder DOCX, max. 8 MB
            </span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFile}
        />

        {uploadError && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-loss/15 px-2 py-1 text-[11px] text-loss">
            <AlertTriangle className="h-3 w-3" /> {uploadError}
          </div>
        )}
      </div>

      {/* Text-Alternative */}
      <div className="card-base p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-brand" /> Alternativ als Text
          </h3>
          <button
            onClick={() => setTextPreview(!textPreview)}
            className="btn-ghost inline-flex items-center gap-1 text-xs"
          >
            {textPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {textPreview ? "Editor zeigen" : "Vorschau"}
          </button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Falls du keine Datei hochlaedst, wird dieser Text inline gerendert. Markdown-Untermenge: <code>**fett**</code>, leere Zeilen = Absatz, <code>#</code> Heading.
        </p>

        {textPreview ? (
          <div className="prose prose-sm max-w-none rounded-md border border-border bg-muted/20 p-4 text-sm leading-relaxed">
            {doc.text ? (
              <RenderMarkdownLite text={doc.text} />
            ) : (
              <p className="italic text-muted-foreground">Noch kein Text hinterlegt.</p>
            )}
          </div>
        ) : (
          <textarea
            rows={16}
            className="input-base font-mono text-[12px] leading-relaxed"
            placeholder={meta.placeholder}
            value={doc.text}
            onChange={(e) => setDoc({ ...doc, text: e.target.value })}
            spellCheck
          />
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-muted-foreground">
            {doc.text ? (
              <>
                {doc.text.length.toLocaleString("de-DE")} Zeichen ·{" "}
                {doc.text.trim().split(/\s+/).filter(Boolean).length.toLocaleString("de-DE")} Woerter
              </>
            ) : (
              "Noch leer"
            )}
            {doc.updatedAt && (
              <>
                <span className="mx-2">·</span>
                Zuletzt geaendert {new Date(doc.updatedAt).toLocaleString("de-DE")}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-0.5 text-[11px] text-profit">
                <CheckCircle2 className="h-3 w-3" /> Gespeichert
              </span>
            )}
            <button onClick={saveText} className="btn-brand">Text speichern</button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        Phase 2: Datei wird in R2/Blob abgelegt, Text in DB. Beide werden ueber <code>/api/legal/{slug}</code> ausgeliefert und in Footer-Links + Login-Seite verlinkt.
      </div>
    </div>
  );
}

/**
 * Sehr leichte Markdown-Untermenge fuer Vorschau:
 *  - Leerzeilen → Absatz
 *  - **fett**  → <strong>
 *  - # / ## / ### / #### / ##### / ###### → <h1..h6>
 *  - - foo / * foo am Zeilenanfang → Liste
 */
function RenderMarkdownLite({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trimEnd());
        if (lines.every((l) => /^\s*[-*]\s/.test(l))) {
          return (
            <ul key={i} className="my-2 list-disc pl-5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*[-*]\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        const hMatch = lines[0]?.match(/^(#{1,6})\s+(.*)/);
        if (hMatch) {
          const level = hMatch[1]!.length;
          const content = hMatch[2]!;
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          return (
            <Tag key={i} className="mb-1 mt-3 font-bold">
              {renderInline(content)}
            </Tag>
          );
        }
        return (
          <p key={i} className="my-2 whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </>
  );
}

function renderInline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
