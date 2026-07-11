import { describe, expect, it } from "vitest"
import type { ChangeIntent, ImpactedAsset } from "@/lib/types"
import { score } from "./score"

const intent = (over: Partial<ChangeIntent>): ChangeIntent => ({
  entity: "fct_orders",
  changeType: "COLUMN_DROPPED",
  detail: "test",
  ...over,
})

const impact = (
  over: Partial<Omit<ImpactedAsset, "severity">>
): Omit<ImpactedAsset, "severity"> => ({
  urn: "urn:li:dataset:x",
  name: "downstream",
  entityType: "dataset",
  hop: 1,
  sourceEntity: "fct_orders",
  ...over,
})

describe("score", () => {
  it("BREAKING when a dropped column is consumed downstream", () => {
    const report = score(
      [intent({ column: "customer_email" })],
      [impact({ viaColumn: "customer_email" })],
      []
    )
    expect(report.severity).toBe("BREAKING")
    expect(report.impacts[0].severity).toBe("BREAKING")
  })

  it("RISKY when destructive but column consumption unconfirmed", () => {
    const report = score([intent({ column: "customer_email" })], [impact({})], [])
    expect(report.severity).toBe("RISKY")
  })

  it("SAFE for additive changes with downstream consumers", () => {
    const report = score(
      [intent({ changeType: "COLUMN_ADDED", column: "margin_pct" })],
      [impact({})],
      []
    )
    expect(report.severity).toBe("SAFE")
  })

  it("SAFE when destructive change has no downstream consumers", () => {
    const report = score([intent({ column: "customer_email" })], [], [])
    expect(report.severity).toBe("SAFE")
  })

  it("never SAFE when a destructive entity is unresolved in the catalog", () => {
    const report = score([intent({})], [], ["fct_orders"])
    expect(report.severity).toBe("RISKY")
  })

  it("never SAFE when any entity is unresolved and changes exist", () => {
    const report = score(
      [intent({ changeType: "COLUMN_ADDED", entity: "mystery_model" })],
      [],
      ["mystery_model"]
    )
    expect(report.severity).toBe("RISKY")
  })

  it("ENTITY_DROPPED marks its own downstream assets BREAKING", () => {
    const report = score(
      [intent({ changeType: "ENTITY_DROPPED" })],
      [impact({})],
      []
    )
    expect(report.severity).toBe("BREAKING")
  })

  it("does not contaminate across entities: dropping A never escalates B's consumers", () => {
    const report = score(
      [
        intent({ changeType: "ENTITY_DROPPED", entity: "deprecated_model" }),
        intent({ changeType: "COLUMN_ADDED", entity: "fct_orders", column: "margin_pct" }),
      ],
      [impact({ sourceEntity: "fct_orders" })],
      []
    )
    // fct_orders only had an additive change; its consumer stays SAFE.
    expect(report.impacts[0].severity).toBe("SAFE")
    // deprecated_model had no found consumers, so nothing is BREAKING.
    expect(report.severity).toBe("SAFE")
  })

  it("LOGIC_CHANGED with consumers is RISKY, not BREAKING", () => {
    const report = score(
      [intent({ changeType: "LOGIC_CHANGED" })],
      [impact({})],
      []
    )
    expect(report.severity).toBe("RISKY")
    expect(report.impacts[0].severity).toBe("RISKY")
  })

  it("no intents means SAFE", () => {
    const report = score([], [], [])
    expect(report.severity).toBe("SAFE")
  })
})
