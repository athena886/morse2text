import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://morse2text.com"),
  title: "Morse Code Translator & Generator — Free Online Tool | morse2text",
  description: "Free online Morse Code Translator & Generator. Convert text to Morse code and Morse code to text instantly. Hear the sound, see the flashing light, download audio. No sign-up required.",
  alternates: { canonical: "/" },
  openGraph: { title: "Morse Code Translator & Generator", description: "Turn text into sound, light, and Morse code—instantly.", url: "/", siteName: "morse2text", type: "website", images: [{url:"/og.png",width:1200,height:630,alt:"morse2text Morse Code Translator & Generator"}] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/></head><body>{children}</body></html>;
}
