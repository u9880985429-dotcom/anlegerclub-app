"use client";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";

interface LikeButtonProps {
  initialCount?: number;
}

/**
 * Spec §10: Likes only — kein Dislike.
 */
export function LikeButton({ initialCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  return (
    <button
      type="button"
      onClick={() => {
        setLiked(!liked);
        setCount((c) => c + (liked ? -1 : 1));
      }}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        liked
          ? "border-brand bg-brand/10 text-brand"
          : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
      }`}
      aria-pressed={liked}
    >
      <ThumbsUp className="h-3.5 w-3.5" />
      <span className="font-mono">{count}</span>
    </button>
  );
}
