// Next-App-Router-Template: wird bei JEDEM Navigationswechsel neu gemountet
// (anders als layout.tsx). Dadurch bekommt jede navigierte Seite im
// Mitglieder-/Admin-Bereich eine weiche Einblendung. Die Animation
// 'animate-fade-in' (tailwind.config) wird durch den globalen
// prefers-reduced-motion-Block automatisch deaktiviert.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
