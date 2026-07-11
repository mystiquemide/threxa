import { describe, expect, it } from "vitest"
import { dataFiles } from "./gate"

const file = (filename: string) => ({ filename, status: "modified" })

describe("dataFiles", () => {
  it("passes SQL files anywhere", () => {
    expect(dataFiles([file("models/marts/fct_orders.sql")])).toHaveLength(1)
    expect(dataFiles([file("queries/report.SQL")])).toHaveLength(1)
  })

  it("passes YAML only under a models directory", () => {
    expect(dataFiles([file("models/schema.yml")])).toHaveLength(1)
    expect(dataFiles([file("dbt/models/staging/sources.yaml")])).toHaveLength(1)
    expect(dataFiles([file(".github/workflows/ci.yml")])).toHaveLength(0)
  })

  it("ignores non-data files", () => {
    expect(
      dataFiles([file("README.md"), file("src/app/page.tsx"), file("package.json")])
    ).toHaveLength(0)
  })
})
