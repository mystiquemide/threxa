"use client"

import { useEffect, useState } from "react"

interface Health {
  db: boolean
  mcp: boolean
  datahub: boolean
}

const labels: Record<keyof Health, string> = {
  db: "postgres",
  mcp: "mcp server",
  datahub: "datahub",
}

export function StatusStrip() {
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  if (!health) return null

  return (
    <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-fog-soft">
      {(Object.keys(labels) as (keyof Health)[]).map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${health[key] ? "bg-sage" : "bg-fog/25"}`}
            aria-hidden
          />
          {labels[key]}
          <span className="sr-only">{health[key] ? "connected" : "offline"}</span>
        </span>
      ))}
    </div>
  )
}
