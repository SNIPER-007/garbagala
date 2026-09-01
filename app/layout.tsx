import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/firebase/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Garba Gala 2026 | Official Ticket Passes & Event Entry",
  description: "Secure your official entry passes for Garba Gala 2026 at Golden Celebration Hall, Mulund West. Featuring Nisha Soni, Jiger Dama & live fusion orchestra. ₹450 General Sale passes available now!",
  openGraph: {
    title: "Garba Gala 2026 | Grand Dandiya Celebration",
    description: "27 September 2026 • Golden Celebration Hall, Mulund West • Live Artists & Orchestra. Get your pass for ₹450!",
    url: "https://garbagala.com",
    siteName: "Garba Gala 2026",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garba Gala 2026 | Official Ticket Passes",
    description: "Mumbai's premier Garba & Dandiya festival on 27 Sept 2026. Book passes online instantly!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-[#0A090D] text-white antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
