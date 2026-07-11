import type { Metadata } from "next"
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] })
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Threxa - The blast-radius agent for data model PRs",
  description:
    "Threxa reviews every data-model pull request against DataHub lineage, names what breaks and who owns it, and writes the change back into the catalog.",
  openGraph: {
    title: "Threxa - The blast-radius agent for data model PRs",
    description:
      "Every data-model PR reviewed against live DataHub lineage: what breaks, who owns it, how to fix it.",
    type: "website",
    siteName: "Threxa",
  },
  twitter: {
    card: "summary",
    title: "Threxa - The blast-radius agent for data model PRs",
    description:
      "Every data-model PR reviewed against live DataHub lineage: what breaks, who owns it, how to fix it.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
