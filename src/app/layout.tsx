import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UsernameProvider } from "@/components/username/UsernameProvider";
import { UsernameModal } from "@/components/username/UsernameModal";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CasperSource — Cybersecurity Mini-Games & Leaderboard",
    template: "%s — CasperSource",
  },
  description:
    "Learn cybersecurity by playing. 12 fast, sharp mini-games covering phishing, passwords, cryptography, network defense and more — climb the leaderboard as you go.",
};

export const viewport: Viewport = {
  themeColor: "#05070a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UsernameProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <UsernameModal />
        </UsernameProvider>
      </body>
    </html>
  );
}
