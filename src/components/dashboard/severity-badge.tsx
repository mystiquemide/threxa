import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  SAFE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  RISKY: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  BREAKING: "bg-red-500/10 text-red-400 border-red-500/30",
  RUNNING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  FAILED: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  SKIPPED: "bg-gray-500/10 text-gray-500 border-gray-600/30",
}

export function SeverityBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        styles[value] ?? styles.FAILED,
        className
      )}
    >
      {value}
    </span>
  )
}
