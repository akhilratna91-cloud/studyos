import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

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
        className={`${spaceGrotesk.className} min-h-screen bg-base text-foreground antialiased selection:bg-primary/30 selection:text-white`}
      >
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute right-[-10%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[24rem] w-[24rem] rounded-full bg-cyan-500/8 blur-[120px]" />

          <Sidebar />

          <div className="relative flex min-h-screen flex-col md:ml-64">
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
