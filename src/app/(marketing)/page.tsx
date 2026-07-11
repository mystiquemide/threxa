import { Hero } from "@/components/landing/hero"
import { ProductTrio } from "@/components/landing/product-trio"
import { ContextArcs } from "@/components/landing/context-arcs"
import { StackRow } from "@/components/landing/stack-row"
import { FeatureRows } from "@/components/landing/feature-rows"
import { CaseCards } from "@/components/landing/case-cards"
import { Faq } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"

export default function Home() {
  return (
    <>
      <Hero />
      <ProductTrio />
      <ContextArcs />
      <StackRow />
      <FeatureRows />
      <CaseCards />
      <Faq />
      <CTA />
    </>
  )
}
