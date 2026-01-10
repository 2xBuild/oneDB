import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apps",
  description: "Discover amazing apps and tools on oneDB. Browse by category, search by tags, and find the perfect app for your needs.",
  openGraph: {
    title: "Apps | oneDB",
    description: "Discover amazing apps and tools on oneDB. Browse by category, search by tags, and find the perfect app for your needs.",
    type: "website",
    images: [
      {
        url: "/api/og?type=apps&title=Apps&description=Discover amazing apps and tools on oneDB",
        width: 1200,
        height: 630,
        alt: "oneDB Apps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apps | oneDB",
    description: "Discover amazing apps and tools on oneDB. Browse by category, search by tags, and find the perfect app for your needs.",
    images: ["/api/og?type=apps&title=Apps&description=Discover amazing apps and tools on oneDB"],
  },
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


