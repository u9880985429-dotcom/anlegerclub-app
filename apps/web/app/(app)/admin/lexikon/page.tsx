import { PageHeader } from "@/components/PageHeader";
import { lexikon } from "@traderiq/api";
import { Plus, Edit2 } from "lucide-react";

export default function AdminLexikonPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Lexikon"
        description={`${lexikon.length} Fachbegriffe`}
        action={
          <button className="btn-brand inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Neuer Begriff
          </button>
        }
      />

      <div className="card-base divide-y divide-border">
        {lexikon.map((l) => (
          <div key={l.id} className="flex items-start justify-between p-4">
            <div className="flex-1">
              <h3 className="font-bold text-brand">{l.term}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{l.definitionMd}</p>
            </div>
            <button className="rounded-md p-1.5 hover:bg-accent"><Edit2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </>
  );
}
