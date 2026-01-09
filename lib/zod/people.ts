import { z } from "zod";

export const createPeopleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  socialMediaPlatform: z.string().min(1),
  socialMediaLink: z.string().url(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  image: z.string().url().optional().or(z.literal("")),
  followersCount: z.number().int().positive().optional(),
});

export type CreatePeopleInput = z.infer<typeof createPeopleSchema>;

