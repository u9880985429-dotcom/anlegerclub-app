"use client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { pitchModules } from "@traderiq/api";
import { Save, ExternalLink } from "lucide-react";

export default function AdminPitchPage() {
  const [pitches, setPitches] = useState(pitchModules);
  const [saved, setSaved] = useState<string | null>(null);

  function update(id: string, key: keyof typeof pitches[0], value: string | boolean) {
    setPitches(pitches.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
    setSaved(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Pitch-Editor"
        description="Headline, Body, CTA-URL, Aktiv-Toggle, Zielgruppe (Spec §14)"
      />

      <div className="space-y-4">
        {pitches.map((p) => (
          <div key={p.id} className="card-base p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="badge-brand">Zielgruppe: {p.audienceProductSlug}</span>
                <h3 className="mt-2 font-semibold">{p.headline}</h3>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) => update(p.id, "active", e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background"
                />
                Aktiv
              </label>
            </div>

            <div className="space-y-3">
              <Field label="Headline">
                <input className="input-base" value={p.headline} onChange={(e) => update(p.id, "headline", e.target.value)} />
              </Field>
              <Field label="Body">
                <textarea className="input-base h-24 resize-y" value={p.bodyMd} onChange={(e) => update(p.id, "bodyMd", e.target.value)} />
              </Field>
              <Field label="CTA-Label">
                <input className="input-base" value={p.ctaLabel} onChange={(e) => update(p.id, "ctaLabel", e.target.value)} />
              </Field>
              <Field label="CTA-URL (mit UTM)">
                <div className="flex gap-2">
                  <input className="input-base font-mono text-xs" value={p.ctaUrl} onChange={(e) => update(p.id, "ctaUrl", e.target.value)} />
                  <a href={p.ctaUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">UTM-Tracking: <code className="font-mono">utm_source=traderiq-app&utm_medium=pitch&utm_campaign=stillhalter-live</code></span>
              <button onClick={() => setSaved(p.id)} className="btn-brand inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> {saved === p.id ? "✓ Gespeichert" : "Speichern"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
