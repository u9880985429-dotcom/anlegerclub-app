import { PlayCircle } from "lucide-react";
import { cn } from "@traderiq/ui";

interface VideoPlaceholderProps {
  title: string;
  duration?: string;
  /** Used to deterministically pick a gradient hue per video. */
  seed?: string;
  className?: string;
}

const GRADIENTS = [
  "from-orange-700/40 via-amber-700/30 to-zinc-900",
  "from-rose-700/40 via-orange-700/30 to-zinc-900",
  "from-amber-700/40 via-yellow-700/30 to-zinc-900",
  "from-emerald-700/40 via-teal-700/30 to-zinc-900",
  "from-indigo-700/40 via-violet-700/30 to-zinc-900",
];

function pickGradient(seed?: string): string {
  if (!seed) return GRADIENTS[0]!;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]!;
}

export function VideoPlaceholder({ title, duration, seed, className }: VideoPlaceholderProps) {
  const grad = pickGradient(seed ?? title);
  return (
    <div
      className={cn(
        "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br",
        grad,
        className,
      )}
    >
      <PlayCircle className="h-14 w-14 text-white/80 transition group-hover:scale-110 group-hover:text-white" strokeWidth={1.5} />
      {duration && (
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-mono text-white">
          {duration}
        </span>
      )}
      <span className="absolute bottom-2 left-2 line-clamp-1 max-w-[70%] rounded bg-black/60 px-2 py-0.5 text-xs text-white/90">
        {title}
      </span>
    </div>
  );
}
