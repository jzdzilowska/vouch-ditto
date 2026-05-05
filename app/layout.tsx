import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Serif, Special_Elite, Inter } from "next/font/google";
import "./globals.css";
import PhoneFrame from "@/components/PhoneFrame";
import PresentationMockButton from "@/components/PresentationMockButton";

// Display serif — Fraunces (light + italic) for the wordmark and headlines.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Italic accent serif — Instrument Serif for emphasized words / friend quotes.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-italic",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

// Tiny mono labels (eyebrows, status pills).
const typewriter = Special_Elite({
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
  weight: "400",
});

// Body sans.
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
    <html lang="en" className={`${fraunces.variable} ${instrument.variable} ${typewriter.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg text-ink font-sans">
        <PresentationMockButton />
        {/* On desktop, wraps the whole app inside an iPhone-shaped frame
            (with notch + status bar + home indicator). On mobile, collapses
            and renders children edge-to-edge. */}
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
