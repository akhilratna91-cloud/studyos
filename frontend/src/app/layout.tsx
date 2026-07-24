import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "StudyOS v1.0.2 | Universal 3D Study Operating System",
  description: "Next-gen study operating system with 50+ competitive exam matrix, Green & Purple glassmorphism, 3D interactive physics, and flow-state analytics.",
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
