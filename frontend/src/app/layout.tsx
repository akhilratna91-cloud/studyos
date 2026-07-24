import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Ambient3DBackground } from "@/components/ui/ambient-3d-bg";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "StudyOS v1.0.1 | AI-Powered 3D Study Platform",
  description: "Next-gen study operating system with Green & Purple glassmorphism, 3D interactive physics, and flow-state analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${plusJakarta.variable} font-[family-name:var(--font-body)] min-h-screen bg-[#07040D] text-foreground antialiased selection:bg-purple-500/30 selection:text-emerald-300`}
      >
        <div className="relative min-h-screen overflow-hidden bg-orbital">
          {/* Ambient 3D Interactive Background */}
          <Ambient3DBackground />

          <Sidebar />

          <div className="relative flex min-h-screen flex-col md:ml-[4.5rem] lg:ml-64 z-10">
            <Topbar />

            <main className="relative z-10 flex-1 px-4 pb-24 pt-24 sm:px-6 lg:px-8 md:pb-8">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
