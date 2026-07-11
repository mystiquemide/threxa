import { isDemoMode } from "@/lib/demo-data"

// Fabricated data must never pass as real history. Rendered on every dashboard
// page whenever demo mode is on.
export function DemoBanner() {
  if (!isDemoMode) return null
  return (
    <div className="mb-6 border border-amberish/40 bg-amberish/10 px-4 py-2 font-mono text-xs text-amberish">
      demo mode: the runs below are sample data illustrating the product, not real analyses
    </div>
  )
}
