import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "People",
  description: "Discover influential people, creators, and thought leaders on oneDB. Find experts across different platforms and industries.",
  openGraph: {
    title: "People | oneDB",
    description: "Discover influential people, creators, and thought leaders on oneDB. Find experts across different platforms and industries.",
    type: "website",
    images: [
      {
        url: "/api/og?type=people&title=People&description=Discover influential people, creators, and thought leaders on oneDB",
        width: 1200,
        height: 630,
        alt: "oneDB People",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "People | oneDB",
    description: "Discover influential people, creators, and thought leaders on oneDB. Find experts across different platforms and industries.",
    images: ["/api/og?type=people&title=People&description=Discover influential people, creators, and thought leaders on oneDB"],
  },
};

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


