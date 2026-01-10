import type { Metadata } from "next";
import { IdeasService } from "@/lib/services/ideas.service";
import { getOgImageUrl } from "@/lib/utils/og-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const ideasService = new IdeasService();
    const idea = await ideasService.findById(id);

    if (!idea) {
      return {
        title: "Idea Not Found",
      };
    }

    const title = idea.title || "Idea";
    const description = idea.description || "Check out this idea on oneDB";
    const tags = idea.tags?.join(",") || "";

    const ogImageUrl = getOgImageUrl({
      type: "idea",
      title,
      description: description.substring(0, 120),
      tags: tags || undefined,
    });

    return {
      title,
      description: description.substring(0, 160),
      openGraph: {
        title: `${title} | oneDB`,
        description,
        type: "website",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | oneDB`,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for idea:", error);
    return {
      title: "Idea | oneDB",
    };
  }
}

export default function IdeaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

