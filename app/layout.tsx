
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/shared/Navbar"
import { Toaster } from "@/components/ui/sonner"
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle"

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
    default: "Reference Heaven",
    template: "%s | Reference Heaven"
  },
  description: "High-end image gallery for artists. Curated reference for anatomy, lighting, and composition.",
  keywords: ["art reference", "anatomy", "lighting", "composition", "artists", "gallery", "photography"],
  authors: [{ name: "Reference Heaven Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://reference-heaven.app",
    title: "Reference Heaven",
    description: "The Ultimate Reference Library for Artists.",
    siteName: "Reference Heaven",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reference Heaven",
    description: "The Ultimate Reference Library for Artists.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>
          <FloatingThemeToggle />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
