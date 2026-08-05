import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://baybayintranslate.com"),
  title: "Baybayin Translator — Instantly Convert English & Tagalog to Baybayin Script",
  description: "Translate English and Tagalog into Baybayin script instantly. Copy, download, preview tattoos, and learn the ancient Filipino writing system free.",
  alternates: { canonical: "/" },
  openGraph: { title: "Baybayin Translator", description: "Write. Learn. Remember. Translate words into the ancient Filipino script.", url: "/", siteName: "BaybayinTranslate.com", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Baybayin Translator — Write. Learn. Remember." }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
