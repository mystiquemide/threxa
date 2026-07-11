import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitPullRequest, Radar, MessageSquareWarning, BookMarked } from "lucide-react"

const items = [
  {
    icon: GitPullRequest,
    title: "Sits on the PR",
    description:
      "A webhook fires when a PR touches SQL or dbt models. No new tools to open, the review lands where the change is.",
  },
  {
    icon: Radar,
    title: "Computes the blast radius",
    description:
      "Multi-hop downstream lineage from DataHub via the official MCP server: tables, dashboards, ML features, and their owners.",
  },
  {
    icon: MessageSquareWarning,
    title: "Posts a verdict",
    description:
      "SAFE, RISKY, or BREAKING. Deterministic scoring, an impact table with owners, and a concrete migration path using real column names.",
  },
  {
    icon: BookMarked,
    title: "Writes back to the catalog",
    description:
      "Every analysis becomes a change record in DataHub. Merged breaking changes raise incidents on the affected assets.",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-white text-center">
          Impact analysis, where code review happens
        </h2>
        <p className="mt-4 text-gray-400 text-center max-w-xl mx-auto">
          The catalog already knows what breaks. Nobody opens it during code review. Threxa
          brings the lineage to the PR.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="h-8 w-8 text-amber-400 mb-3" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
