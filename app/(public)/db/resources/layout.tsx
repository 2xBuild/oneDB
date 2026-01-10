import type { Metadata } from "next";
import { getOgImageUrl } from "@/lib/utils/og-image";

export const metadata: Metadata = {
  title: "Resources",
  description: "Explore curated resources, tutorials, and learning materials on oneDB. Find the best resources to level up your skills.",
  openGraph: {
    title: "Resources | oneDB",
    description: "Explore curated resources, tutorials, and learning materials on oneDB. Find the best resources to level up your skills.",
    type: "website",
    images: [
      {
        url: getOgImageUrl({
          type: "resources",
          title: "Resources",
          description: "Explore curated resources, tutorials, and learning materials on oneDB",
        }),
        width: 1200,
        height: 630,
        alt: "oneDB Resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources | oneDB",
    description: "Explore curated resources, tutorials, and learning materials on oneDB. Find the best resources to level up your skills.",
    images: [getOgImageUrl({
      type: "resources",
      title: "Resources",
      description: "Explore curated resources, tutorials, and learning materials on oneDB",
    })],
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


