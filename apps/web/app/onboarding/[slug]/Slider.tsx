"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { ProductSlug } from "@traderiq/api";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";
import { Logo } from "@/components/Logo";

interface SliderProps {
  slug: ProductSlug;
  slides: { title: string; body: string }[];
}

export function OnboardingSlider({ slug, slides }: SliderProps) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const last = idx === slides.length - 1;

  function handleNext() {
    if (!last) {
      setIdx(idx + 1);
      return;
    }
    const target =
      slug === "all-access"
        ? "/dashboard"
        : slug === "cockpit"
        ? "/depot/cockpit"
        : `/depot/${slug}`;
    router.push(target as never);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Logo variant="dark" size="sm" href="/dashboard" />
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Überspringen
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="card-base w-full max-w-2xl p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= idx ? "bg-brand" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            {PRODUCT_LABELS[slug]} · Tutorial {idx + 1} / {slides.length}
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{slides[idx]?.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{slides[idx]?.body}</p>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setIdx(Math.max(0, idx - 1))}
              disabled={idx === 0}
              className="btn-ghost inline-flex items-center gap-2 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </button>
            <button onClick={handleNext} className="btn-brand inline-flex items-center gap-2">
              {last ? (
                <>
                  Fertig <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Weiter <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Diese Texte sind Platzhalter aus Spec §7 — vom Kunden später im Admin-Backend bearbeitbar.
      </footer>
    </div>
  );
}
