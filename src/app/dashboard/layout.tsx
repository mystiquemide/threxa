import { Nav } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 dark">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
