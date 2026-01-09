import { z } from "zod";

export const createAppSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  url: z.string().url(),
  category: z.string().min(1),
  tags: z.array(z.string().min(1).max(50)).optional(),
  logo: z.string().url().optional().or(z.literal("")),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;

