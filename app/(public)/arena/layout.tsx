import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena",
  description: "Explore projects and ideas from the oneDB community. Share your work, get feedback, and connect with other builders.",
  openGraph: {
    title: "Arena | oneDB",
    description: "Explore projects and ideas from the oneDB community. Share your work, get feedback, and connect with other builders.",
    type: "website",
    images: [
      {
        url: "/api/og?type=arena&title=Arena&description=Explore projects and ideas from the oneDB community",
        width: 1200,
        height: 630,
        alt: "oneDB Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arena | oneDB",
    description: "Explore projects and ideas from the oneDB community. Share your work, get feedback, and connect with other builders.",
    images: ["/api/og?type=arena&title=Arena&description=Explore projects and ideas from the oneDB community"],
  },
};

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


