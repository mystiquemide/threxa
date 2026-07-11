import { isDemoMode } from "@/lib/demo-data"

// Fabricated data must never pass as real history. Rendered on every dashboard
// page whenever demo mode is on.
export function DemoBanner() {
  if (!isDemoMode) return null
  return (
    <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
      Demo mode: the runs below are sample data illustrating the product, not real analyses.
    </div>
  )
}
