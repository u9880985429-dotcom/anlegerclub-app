import { notFound, redirect } from "next/navigation";
import { Scale, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { LegalDocumentEditor, LEGAL_DOCS, type LegalSlug } from "../LegalDocumentEditor";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export default async function LegalDocPage({ params }: { params: { slug: string } }) {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const slug = params.slug as LegalSlug;
  const meta = LEGAL_DOCS[slug];
  if (!meta) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Admin · Technisches Setup"
        title={meta.title}
        description={meta.description}
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-brand" />
        <span>
          <strong className="text-brand">Pflichtinformation:</strong>{" "}
          Diese Texte sind aus dem Footer der App, der Login-Seite und ggf. aus E-Mails verlinkt. Nimm dir Zeit fuer eine sauber redigierte Version — am besten anwaltlich gepruefte Vorlagen.
        </span>
      </div>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Scale className="h-4 w-4 text-brand" /> Inhalt
        </h2>
        <LegalDocumentEditor slug={slug} />
      </section>
    </>
  );
}
