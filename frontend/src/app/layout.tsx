import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "StudyOS | AI-Powered Premium EdTech",
  description: "Next-gen study platform focusing on flow state, gamification, and hyper-addictive UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-[family-name:var(--font-body)] min-h-screen bg-base text-foreground antialiased`}
      >
        <div className="relative min-h-screen overflow-hidden bg-orbital">
          {/* Animated orbital glow blobs */}
          <div className="pointer-events-none fixed right-[-15%] top-[-10%] h-[40rem] w-[40rem] rounded-full bg-primary/[0.07] blur-[160px] animate-float" />
          <div className="pointer-events-none fixed bottom-[-15%] left-[-10%] h-[35rem] w-[35rem] rounded-full bg-accent-cyan/[0.05] blur-[140px] animate-float" style={{ animationDelay: '-3s' }} />
          <div className="pointer-events-none fixed top-[40%] left-[60%] h-[20rem] w-[20rem] rounded-full bg-accent-magenta/[0.04] blur-[120px] animate-float" style={{ animationDelay: '-1.5s' }} />

          <Sidebar />

          <div className="relative flex min-h-screen flex-col md:ml-[4.5rem] lg:ml-64">
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
