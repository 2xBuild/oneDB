import { z } from "zod";

export const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  url: z.string().url(),
  category: z.string().min(1),
  tags: z.array(z.string().min(1).max(50)).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;

