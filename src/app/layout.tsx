import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swaad AI - Taste Powered by Intelligence",
  description:
    "Discover and order delicious food through natural conversations with our AI-powered assistant. Browse 100+ dishes across Indian cuisines.",
  keywords: [
    "food ordering",
    "AI assistant",
    "Indian cuisine",
    "restaurant",
    "online order",
  ],
  openGraph: {
    title: "Swaad AI - AI-Powered Food Ordering",
    description:
      "Chat with our intelligent assistant to discover and order the perfect meal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <CartDrawer />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
