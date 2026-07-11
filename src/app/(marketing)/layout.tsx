import { MarketingNav } from "@/components/landing/marketing-nav"
import { MarketingFooter } from "@/components/landing/marketing-footer"
import { Ticker } from "@/components/landing/ticker"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dot-grid min-h-screen bg-paper text-ink">
      <Ticker />
      <div className="mx-auto max-w-[1400px] border-x border-hairline">
        <MarketingNav />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </div>
  )
}
