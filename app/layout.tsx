

import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/contexts/auth-context";
import { Providers } from "@/components/providers";

import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/ui";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
export const metadata: Metadata = {
  title: {
    default: "oneDB",
    template: "%s | oneDB"
  },
  description: "Your one database for all resources, projects, and people. Discover projects, ideas, people, apps, and resources all in one place. Explore, contribute, and build with the oneDB community.",
  keywords: ["database", "resources", "projects", "people", "apps", "ideas", "community", "curated", "discovery"],
  authors: [{ name: "iBuild" }],
  creator: "oneDB",
  publisher: "oneDB",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "oneDB",
    title: "oneDB - Your one database for everything you need",
    description: "Discover projects, ideas, people, apps, and resources all in one place. Explore, contribute, and build with the oneDB community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "oneDB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "oneDB - Your one database for everything you need",
    description: "Discover projects, ideas, people, apps, and resources all in one place.",
    images: ["/og-image.png"],
    creator: "@onedb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Icons are automatically generated from app/icon.svg by Next.js
  // Additional icons can be added to public/ folder if needed
  verification: {
    // Add verification codes here when available
    // google: "verification-code",
    // yandex: "verification-code",
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
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </Providers>
        </ThemeProvider>

      </body>
    </html>
  );
}
