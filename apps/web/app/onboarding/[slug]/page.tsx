import { notFound } from "next/navigation";
import { requireSession } from "@/lib/access";
import { ONBOARDING } from "@/lib/copy/onboarding";
import type { ProductSlug } from "@traderiq/api";
import { OnboardingSlider } from "./Slider";

const VALID: ProductSlug[] = ["starter", "trend", "stillhalter", "cockpit", "all-access"];

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: { params: { slug: string } }) {
  await requireSession();
  if (!VALID.includes(params.slug as ProductSlug)) notFound();
  const slug = params.slug as ProductSlug;
  return <OnboardingSlider slug={slug} slides={ONBOARDING[slug]} />;
}
