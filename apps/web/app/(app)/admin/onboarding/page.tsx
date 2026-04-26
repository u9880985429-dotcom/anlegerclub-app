"use client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ONBOARDING } from "@/lib/copy/onboarding";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";
import type { ProductSlug } from "@traderiq/api";
import { Save } from "lucide-react";

const SLUGS: ProductSlug[] = ["starter", "trend", "stillhalter", "cockpit", "all-access"];

export default function AdminOnboardingPage() {
  const [active, setActive] = useState<ProductSlug>("starter");
  const slides = ONBOARDING[active];
  const [draft, setDraft] = useState(slides);
  const [saved, setSaved] = useState(false);

  function update(idx: number, key: "title" | "body", value: string) {
    setDraft(draft.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
    setSaved(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Onboarding-Editor"
        description="Slides je Depot bearbeitbar (Spec §7) · Phase 2: persistiert in DB"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {SLUGS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setActive(s);
              setDraft(ONBOARDING[s]);
              setSaved(false);
            }}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              active === s ? "bg-brand text-white" : "btn-secondary"
            }`}
          >
            {PRODUCT_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {draft.map((s, i) => (
          <div key={i} className="card-base p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">Slide {i + 1} / {draft.length}</span>
            </div>
            <input
              className="input-base mb-2 font-semibold"
              value={s.title}
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <textarea
              className="input-base h-20 resize-y"
              value={s.body}
              onChange={(e) => update(i, "body", e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Phase 1: nur lokal im Speicher.</span>
        <button onClick={() => setSaved(true)} className="btn-brand inline-flex items-center gap-2">
          <Save className="h-4 w-4" /> {saved ? "✓ Gespeichert (Mock)" : "Speichern"}
        </button>
      </div>
    </>
  );
}
