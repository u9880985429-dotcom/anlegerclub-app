"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Search, Filter, Trash2, Edit3, Type, Eye, X } from "lucide-react";

type FontStyle = "normal" | "italic" | "oblique";
type FontDisplay = "auto" | "swap" | "block" | "fallback" | "optional";

interface FontEntry {
  id: number;
  name: string;
  weight: number;
  style: FontStyle;
  display: FontDisplay;
  fallback: string;
  createdAt: string;
  // Phase 1: optional Daten-URL fuer Live-Preview hochgeladener Fonts
  dataUrl?: string;
  format?: "woff2" | "woff" | "ttf" | "otf";
}

const SEED: FontEntry[] = [
  { id: 5571, name: "GillSans Condensed", weight: 400, style: "normal", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:55:00Z" },
  { id: 5570, name: "GillSans Condensed Bold", weight: 700, style: "normal", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:54:30Z" },
  { id: 5569, name: "Gill Sans", weight: 400, style: "normal", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:54:15Z" },
  { id: 5568, name: "Gill Sans Medium", weight: 500, style: "normal", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:54:00Z" },
  { id: 5567, name: "Gill Sans Medium Italic", weight: 500, style: "italic", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:54:00Z" },
  { id: 5566, name: "Gill Sans Light", weight: 300, style: "normal", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:54:00Z" },
  { id: 5565, name: "Gill Sans Light Italic", weight: 300, style: "italic", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:53:30Z" },
  { id: 5564, name: "Gill Sans Italic", weight: 400, style: "italic", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:53:00Z" },
  { id: 5563, name: "Gill Sans Heavy", weight: 800, style: "normal", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:53:00Z" },
  { id: 5562, name: "Gill Sans Heavy Italic", weight: 800, style: "italic", display: "swap", fallback: "Montserrat", createdAt: "2024-09-26T17:53:00Z" },
];

const STORAGE_KEY = "traderiq:fonts";

const PREVIEW_PHRASE = "The quick brown fox · TRADER IQ · 0123456789 · €$£¥";

export function FontManager() {
  const [fonts, setFonts] = useState<FontEntry[]>(SEED);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<"all" | FontStyle>("all");
  const [editing, setEditing] = useState<FontEntry | null>(null);
  const [previewing, setPreviewing] = useState<FontEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FontEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) setFonts(parsed);
      }
    } catch {}
  }, []);

  function persist(next: FontEntry[]) {
    setFonts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const filtered = useMemo(() => {
    return fonts.filter((f) => {
      if (styleFilter !== "all" && f.style !== styleFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || String(f.id).includes(q) || f.fallback.toLowerCase().includes(q);
    });
  }, [fonts, query, styleFilter]);

  function onUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() as FontEntry["format"] | undefined;
    if (!ext || !["woff2", "woff", "ttf", "otf"].includes(ext)) {
      alert("Nicht unterstuetztes Format. Erlaubt: WOFF2, WOFF, TTF, OTF.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const id = Math.max(...fonts.map((f) => f.id), 5500) + 1;
    const newFont: FontEntry = {
      id,
      name: file.name.replace(/\.[^.]+$/, ""),
      weight: 400,
      style: "normal",
      display: "swap",
      fallback: "Montserrat",
      createdAt: new Date().toISOString(),
      dataUrl,
      format: ext,
    };
    persist([newFont, ...fonts]);
    setEditing(newFont);
    e.target.value = "";
  }

  function saveEdit(updated: FontEntry) {
    persist(fonts.map((f) => (f.id === updated.id ? updated : f)));
    setEditing(null);
  }

  function remove(id: number) {
    if (!confirm("Schriftart wirklich loeschen? Sie wird aus allen Theme-Konfigurationen entfernt.")) return;
    persist(fonts.filter((f) => f.id !== id));
  }

  // Inject @font-face fuer hochgeladene Fonts (mit dataUrl) — fuer die Live-Preview
  const fontFaceCss = useMemo(() => {
    return fonts
      .filter((f) => f.dataUrl)
      .map(
        (f) => `@font-face {
  font-family: "${f.name.replace(/"/g, "")}";
  src: url(${f.dataUrl}) format("${f.format ?? "woff2"}");
  font-weight: ${f.weight};
  font-style: ${f.style};
  font-display: ${f.display};
}`,
      )
      .join("\n");
  }, [fonts]);

  if (!mounted) return null;

  return (
    <div className="space-y-3">
      {fontFaceCss && <style dangerouslySetInnerHTML={{ __html: fontFaceCss }} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Name, ID oder Fallback ..."
            className="input-base h-9 w-full pl-8 text-xs"
          />
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select className="input-base h-9 text-xs" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value as "all" | FontStyle)}>
            <option value="all">Alle Stile</option>
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>
        <button onClick={onUploadClick} className="btn-brand inline-flex items-center gap-1">
          <Upload className="h-3.5 w-3.5" /> Schriftart hochladen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Tabelle */}
      <div className="card-base overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 w-16">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Schriftgroesse</th>
              <th className="px-3 py-2">Schrifttyp</th>
              <th className="px-3 py-2">Schriftanzeige</th>
              <th className="px-3 py-2">Fallback</th>
              <th className="px-3 py-2">Erstellt</th>
              <th className="px-3 py-2 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                  Keine Schriftarten gefunden. Lade eine hoch oder passe deinen Filter an.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.id} className="hover:bg-accent/40">
                  <td className="px-3 py-2 font-mono text-muted-foreground">{f.id}</td>
                  <td className="px-3 py-2 font-medium">
                    <div className="flex items-center gap-2">
                      <Type className="h-3.5 w-3.5 text-muted-foreground" />
                      {f.name}
                      {f.dataUrl && (
                        <span className="rounded-md bg-profit/15 px-1 py-0.5 text-[9px] font-semibold text-profit">UPLOAD</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono">{f.weight}</td>
                  <td className="px-3 py-2">{f.style}</td>
                  <td className="px-3 py-2">{f.display}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.fallback}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                    {new Date(f.createdAt).toLocaleString("de-DE")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => setPreviewing(f)} className="btn-ghost" aria-label="Vorschau">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditing(f)} className="btn-ghost" aria-label="Bearbeiten">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(f.id)} className="btn-ghost text-destructive" aria-label="Loeschen">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit-Modal */}
      {editing && <EditModal entry={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}

      {/* Preview-Modal */}
      {previewing && <PreviewModal entry={previewing} onClose={() => setPreviewing(null)} />}
    </div>
  );
}

function EditModal({ entry, onClose, onSave }: { entry: FontEntry; onClose: () => void; onSave: (next: FontEntry) => void }) {
  const [draft, setDraft] = useState<FontEntry>(entry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-base w-full max-w-2xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Schriftbearbeitung</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Du kannst beliebige Web-Schriftarten hochladen, sie werden der Schriftartenliste hinzugefuegt. Fuer maximale Browserunterstuetzung lade WOFF2, TTF, OTF hoch.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <strong>Lizenzpflicht:</strong> Das Hochladen ohne gueltige Lizenz ist unzulaessig.
            </p>
          </div>
          <button onClick={onClose} aria-label="Schliessen" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          <Field label="Schriftartenname" required>
            <input className="input-base" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Schriftgroesse" required>
            <select className="input-base" value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })}>
              <option value={300}>300 (Light)</option>
              <option value={400}>400 (Normal)</option>
              <option value={500}>500 (Medium)</option>
              <option value={600}>600 (Semibold)</option>
              <option value={700}>700 (Bold)</option>
              <option value={800}>800 (Heavy)</option>
              <option value={900}>900 (Black)</option>
            </select>
          </Field>
          <Field label="Schrifttyp" required>
            <select className="input-base" value={draft.style} onChange={(e) => setDraft({ ...draft, style: e.target.value as FontStyle })}>
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="oblique">Oblique</option>
            </select>
          </Field>
          <Field label="Schriftanzeige" required>
            <select className="input-base" value={draft.display} onChange={(e) => setDraft({ ...draft, display: e.target.value as FontDisplay })}>
              <option value="auto">Auto</option>
              <option value="swap">Swap</option>
              <option value="block">Block</option>
              <option value="fallback">Fallback</option>
              <option value="optional">Optional</option>
            </select>
          </Field>
          <Field label="Fallback-Schriftart" required>
            <select className="input-base" value={draft.fallback} onChange={(e) => setDraft({ ...draft, fallback: e.target.value })}>
              <option value="Montserrat">Montserrat</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="system-ui">system-ui</option>
              <option value="serif">serif</option>
              <option value="sans-serif">sans-serif</option>
            </select>
          </Field>
        </div>

        {draft.dataUrl && (
          <div className="mt-5 rounded-md border border-dashed border-border p-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Live-Vorschau</p>
            <p
              className="text-2xl"
              style={{
                fontFamily: `"${draft.name.replace(/"/g, "")}", ${draft.fallback}, system-ui`,
                fontWeight: draft.weight,
                fontStyle: draft.style,
              }}
            >
              {PREVIEW_PHRASE}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onClose} className="btn-ghost">Abbrechen</button>
          <button onClick={() => onSave(draft)} className="btn-brand">Speichern</button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ entry, onClose }: { entry: FontEntry; onClose: () => void }) {
  const fam = `"${entry.name.replace(/"/g, "")}", ${entry.fallback}, system-ui`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-base w-full max-w-3xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Vorschau · {entry.name}</h3>
            <p className="text-xs text-muted-foreground">
              Weight {entry.weight} · {entry.style} · Fallback: {entry.fallback}
              {!entry.dataUrl && (
                <span className="ml-2 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  Kein Upload — Vorschau verwendet Fallback
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} aria-label="Schliessen" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 rounded-md border border-border bg-muted/20 p-5" style={{ fontFamily: fam, fontWeight: entry.weight, fontStyle: entry.style }}>
          <div className="text-4xl">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm</div>
          <div className="text-2xl">Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</div>
          <div className="text-lg">0123456789 · €$£¥ · @&#%!?</div>
          <div className="border-t border-border pt-4 text-sm">
            <strong>Trader IQ — Anlegerclub:</strong> Wir liefern dir eigene Tradingstrategien, Live-Trades, Marktanalysen und ein engagiertes Community-Forum. Konzentriere dich auf das Wesentliche — wir kuemmern uns um den Rest.
          </div>
          <div className="text-xs text-muted-foreground">
            <em>Italic-Test:</em> Diese Schrift wirkt im Fliesstext besonders gut, wenn sie zwischen 14px und 18px gerendert wird. Headlines profitieren ab 24px.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold">
        {label}
        {required && <span className="text-loss"> *</span>}
      </span>
      {children}
    </label>
  );
}
