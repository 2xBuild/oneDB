import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database",
  description: "Browse our curated database of people, apps, and resources. Discover talented individuals, useful tools, and valuable learning materials all in one place.",
  openGraph: {
    title: "Database | oneDB",
    description: "Browse our curated database of people, apps, and resources. Discover talented individuals, useful tools, and valuable learning materials all in one place.",
    type: "website",
    images: [
      {
        url: "/api/og?type=database&title=Database&description=Browse our curated database of people, apps, and resources",
        width: 1200,
        height: 630,
        alt: "oneDB Database",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Database | oneDB",
    description: "Browse our curated database of people, apps, and resources. Discover talented individuals, useful tools, and valuable learning materials all in one place.",
    images: ["/api/og?type=database&title=Database&description=Browse our curated database of people, apps, and resources"],
  },
};

export default function DbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


