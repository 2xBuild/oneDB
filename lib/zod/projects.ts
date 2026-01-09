import { z } from "zod";

const urlSchema = z.string().url().optional().or(z.literal(""));

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  tagline: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  githubLink: urlSchema,
  liveLink: urlSchema,
  projectImage: urlSchema,
  tags: z.array(z.string().min(1).max(50)).optional(),
  status: z.enum(["published", "archived"]).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  tagline: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  githubLink: urlSchema,
  liveLink: urlSchema,
  projectImage: urlSchema,
  tags: z.array(z.string().min(1).max(50)).optional(),
  status: z.enum(["published", "archived"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

