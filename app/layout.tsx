import type { Metadata, Viewport } from "next";
import { Playfair_Display, Special_Elite, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const typewriter = Special_Elite({
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
  weight: "400",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vouch — let your friends write your dating profile",
  description:
    "Sign up, send a link to friends, get a profile written by the people who actually know you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0B0B0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${typewriter.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg text-ink font-sans">{children}</body>
    </html>
  );
}
