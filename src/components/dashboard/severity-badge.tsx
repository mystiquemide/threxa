import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  SAFE: "bg-sage/10 text-sage border-sage/40",
  RISKY: "bg-amberish/10 text-amberish border-amberish/40",
  BREAKING: "bg-ember/10 text-ember border-ember/40",
  RUNNING: "bg-fog/10 text-fog border-fogline",
  FAILED: "bg-fog/5 text-fog-soft border-fogline",
  SKIPPED: "bg-fog/5 text-fog-soft border-fogline",
}

export function SeverityBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-0.5 font-mono text-xs font-semibold tracking-wide",
        styles[value] ?? styles.FAILED,
        className
      )}
    >
      {value}
    </span>
  )
}
