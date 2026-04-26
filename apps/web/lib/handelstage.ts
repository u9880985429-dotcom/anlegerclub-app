/**
 * Berechnet einen Cutoff für "letzte N Handelstage" (Mo–Fr, simple Approximation
 * ohne US-Feiertags-Kalender — reicht für die Phase-1-Demo).
 */
export function lastNHandelstageCutoffISO(n = 7): string {
  const d = new Date();
  let counted = 0;
  while (counted < n) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) counted++; // Sa=6, So=0
  }
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function isWithinLastHandelstage(iso: string, n = 7): boolean {
  return iso >= lastNHandelstageCutoffISO(n);
}
