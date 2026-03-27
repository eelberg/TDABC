import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AbcProvider } from "@/lib/abc-context";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TVUP · TDABC",
  description:
    "Time-driven activity-based costing MVP for TVUP business units (TVaaS, TCS, Tivify).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AbcProvider>{children}</AbcProvider>
      </body>
    </html>
  );
}
