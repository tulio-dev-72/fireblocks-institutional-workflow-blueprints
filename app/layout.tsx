import type { Metadata } from "next";
import { Bricolage_Grotesque, Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import "./globals.css";

const geistSans = Schibsted_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Spline_Sans_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Treasury Control Center | Institutional Settlement Governance",
  description:
    "Institutional stablecoin settlement governance — authorization workflows, MPC custody controls, and audit visibility on Fireblocks infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full min-w-0 text-ops-text antialiased">
        <Providers>
          <PageViewTracker />
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
