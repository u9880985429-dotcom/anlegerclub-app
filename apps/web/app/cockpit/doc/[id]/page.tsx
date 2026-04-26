import { notFound } from "next/navigation";
import { getCockpitDocumentById } from "@traderiq/api";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  perspektiven: "Perspektiven",
  tagesblick: "Tagesblick",
  wochenblick: "Wochenblick",
  monatsblick: "Monatsblick",
  calendar: "Economic Calendar",
};

export default function CockpitDocPage({ params }: { params: { id: string } }) {
  const doc = getCockpitDocumentById(params.id);
  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Print controls (hidden in print) */}
      <div className="print:hidden bg-muted/40 border-b border-border">
        <div className="mx-auto flex max-w-[210mm] items-center justify-between px-6 py-3 text-sm">
          <a href="/depot/cockpit" className="text-brand hover:underline">← Zurück zum Cockpit</a>
          <PrintButton />
        </div>
      </div>

      {/* DIN A4 page (210mm × 297mm) */}
      <article className="mx-auto max-w-[210mm] bg-white px-12 py-12 print:p-0 print:shadow-none">
        {/* Header / Cover */}
        <header className="mb-10 border-b-4 border-brand pb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Inline-SVG-Logo (TRADER IQ in brand) */}
              <span className="text-3xl font-extrabold tracking-tight text-foreground">TRADER<span className="text-brand">IQ</span></span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Die Investoren-Akademie</span>
            </div>
            <span className="text-xs uppercase tracking-wider text-brand font-semibold">{KIND_LABEL[doc.kind]}</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-foreground">{doc.title}</h1>
          {doc.subtitle && <p className="mt-2 text-lg text-muted-foreground">{doc.subtitle}</p>}
          <p className="mt-3 text-xs text-muted-foreground">Stand: {new Date(doc.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </header>

        {/* Body */}
        <div className="prose-cockpit">
          {renderMarkdown(doc.bodyMd)}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-4 text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} Trader IQ Anlegerclub · info@traderiq.net · https://traderiq.net<br />
          Inhalte stellen keine Anlageberatung dar. Handeln auf eigenes Risiko.
        </footer>
      </article>

      <style>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          body { background: white !important; }
        }
        .prose-cockpit h2 { font-size: 1.4rem; font-weight: 800; color: hsl(var(--foreground)); margin-top: 1.6rem; margin-bottom: 0.5rem; }
        .prose-cockpit h2::before { content: ""; display: block; width: 36px; height: 3px; background: #ff741f; margin-bottom: 8px; }
        .prose-cockpit p { font-size: 0.92rem; line-height: 1.6; margin-bottom: 0.8rem; color: hsl(var(--foreground)); }
        .prose-cockpit ul { margin: 0.5rem 0 1rem 0.5rem; }
        .prose-cockpit ul li { font-size: 0.92rem; line-height: 1.55; margin-bottom: 0.25rem; padding-left: 0.6rem; position: relative; }
        .prose-cockpit ul li::before { content: "•"; position: absolute; left: -0.2rem; color: #ff741f; font-weight: 800; }
        .prose-cockpit strong { font-weight: 700; color: hsl(var(--foreground)); }
      `}</style>
    </div>
  );
}

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={`ul_${out.length}`}>
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inline(item) }} />
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.startsWith("## ")) {
      flushList();
      out.push(<h2 key={`h_${i}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("• ")) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      out.push(<p key={`p_${i}`} dangerouslySetInnerHTML={{ __html: inline(line) }} />);
    }
  }
  flushList();
  return out;
}

function inline(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
