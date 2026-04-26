import { PageHeader } from "@/components/PageHeader";
import { allLessons } from "@traderiq/api";
import { Upload, Edit2, Tag } from "lucide-react";

export default function AdminVideosPage() {
  const withVideo = allLessons.filter((l) => l.videoAssetId);
  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Videos"
        description="Direct-Upload zu Mux · Tagging · Verknüpfung mit Lessons"
        action={
          <button className="btn-brand inline-flex items-center gap-2">
            <Upload className="h-4 w-4" /> Video hochladen
          </button>
        }
      />

      <div className="rounded-md border border-dashed border-brand/40 bg-brand/5 p-4 text-xs text-muted-foreground mb-4">
        Phase 1: Direct-Upload-UI als Skeleton. Phase 3: vollständige Mux-Pipeline mit DRM + Watermark.
      </div>

      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Mux Asset-ID</th>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3">Depot</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withVideo.map((l) => (
              <tr key={l.id} className="hover:bg-accent/40">
                <td className="px-4 py-3 font-mono text-xs">{l.videoAssetId}</td>
                <td className="px-4 py-3">{l.title}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.section}</td>
                <td className="px-4 py-3"><span className="badge-base">{l.productSlug}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground inline-flex items-center gap-1"><Tag className="h-3 w-3" /> welcome, intro</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-md p-1.5 hover:bg-accent"><Edit2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
