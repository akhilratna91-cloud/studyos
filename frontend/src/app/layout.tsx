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
