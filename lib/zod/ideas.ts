import { z } from "zod";

const urlSchema = z.string().url().optional().or(z.literal(""));

export const createIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  bannerImage: urlSchema,
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const updateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  bannerImage: urlSchema,
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;

