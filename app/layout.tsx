import type { Metadata } from "next";
import "./globals.css";
import "./content.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://baybayintranslate.com"),
  title: "Baybayin Translator – Convert English & Tagalog to Baybayin",
  description: "Baybayin Translator converts English and Tagalog into Baybayin script instantly. Copy, download, preview tattoos, and learn the Filipino script free.",
  alternates: { canonical: "/" },
  openGraph: { title: "Baybayin Translator", description: "Write. Learn. Remember. Translate words into the ancient Filipino script.", url: "/", siteName: "BaybayinTranslate.com", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Baybayin Translator — Write. Learn. Remember." }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preload" href="/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/noto-sans-tagalog-v23.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body>{children}</body></html>;
}
