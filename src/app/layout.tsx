import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/store";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.businessName} — ${settings.tagline}`,
      template: `%s · ${settings.businessName}`,
    },
    description: settings.tagline,
    openGraph: {
      title: settings.businessName,
      description: settings.tagline,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-dvh font-sans">
        <Header settings={settings} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
