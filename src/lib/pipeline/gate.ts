import type { PrFile } from "@/lib/github"

// F1: only data-relevant files trigger analysis. SQL files anywhere,
// YAML only when it lives under a dbt models/ directory (schema files).
export function dataFiles(files: PrFile[]): PrFile[] {
  return files.filter(
    (f) =>
      /\.sql$/i.test(f.filename) ||
      /(^|\/)models\/.*\.ya?ml$/i.test(f.filename)
  )
}
