import { Nav } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dot-grid-dark min-h-screen flex flex-col bg-night text-fog">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
