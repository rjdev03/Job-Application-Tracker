// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";

const notoSansHeading = Noto_Sans({ subsets: ["latin"], variable: "--font-heading" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Application Tracker | Organize Your Career Search",
  description: "Track your job applications, interviews, and offers in one streamlined visual workspace.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, notoSansHeading.variable)}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 overflow-x-hidden">
        <Navbar />
        {children}
      </body>
    </html>
  );
}