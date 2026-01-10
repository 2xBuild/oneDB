import type { Metadata } from "next";
import { ProjectsService } from "@/lib/services/projects.service";
import { getOgImageUrl } from "@/lib/utils/og-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const projectsService = new ProjectsService();
    const project = await projectsService.findById(id);

    if (!project) {
      return {
        title: "Project Not Found",
      };
    }

    const title = project.title || "Project";
    const description = project.tagline || project.description || "Check out this project on oneDB";
    const tags = project.tags?.join(",") || "";

    const ogImageUrl = getOgImageUrl({
      type: "project",
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
    console.error("Error generating metadata for project:", error);
    return {
      title: "Project | oneDB",
    };
  }
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

