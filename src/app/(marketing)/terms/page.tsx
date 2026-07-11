import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Threxa",
  description: "The terms that apply to using the Threxa service and software.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-ink">
          <span className="block font-serif-display text-5xl italic">Terms of Service</span>
        </h1>
        <p className="mt-4 text-center font-mono text-xs text-ink-soft">
          Effective July 11, 2026
        </p>

        <div className="mt-10 divide-y divide-hairline">
          <Section title="1. The service">
            <p>
              Threxa analyzes pull requests that modify data models, computes the
              downstream impact of those changes using metadata from a connected DataHub
              instance, posts the result to the pull request, and records analysis
              history. The hosted dashboard provides read access to that history.
            </p>
          </Section>

          <Section title="2. The software">
            <p>
              The Threxa source code is open source under the Apache License 2.0. The
              license text in the repository governs your use, modification, and
              distribution of the code. Nothing in these terms restricts rights granted
              by that license.
            </p>
          </Section>

          <Section title="3. Acceptable use">
            <p>
              Do not attempt to disrupt the service, probe or overload its endpoints,
              submit forged webhook payloads, or use the service to process repositories
              you do not have rights to. Webhook deliveries are signature-verified and
              unauthenticated writes are rejected.
            </p>
          </Section>

          <Section title="4. Analysis results">
            <p>
              Verdicts are automated assessments based on the lineage available in the
              connected catalog at analysis time. They are an aid to review, not a
              guarantee. A SAFE verdict does not certify that a change cannot cause
              harm, and you remain responsible for changes you merge.
            </p>
          </Section>

          <Section title="5. Availability and warranty">
            <p>
              The service is provided as is, without warranty of any kind, and may be
              modified, interrupted, or discontinued at any time. To the maximum extent
              permitted by law, the operators of Threxa are not liable for any damages
              arising from use of the service.
            </p>
          </Section>

          <Section title="6. Changes to these terms">
            <p>
              These terms may be updated as the service evolves. Material changes will
              be reflected on this page with a new effective date.
            </p>
          </Section>

          <Section title="7. Contact">
            <p>
              Questions about these terms: open an issue on the{" "}
              <a
                href="https://github.com/mystiquemide/threxa/issues"
                className="underline hover:text-ink"
                target="_blank"
                rel="noreferrer"
              >
                GitHub repository
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
