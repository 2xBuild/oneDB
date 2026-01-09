import { z } from "zod";

export const createVoteSchema = z.object({
  peopleId: z.string().optional(),
  resourceId: z.string().optional(),
  appId: z.string().optional(),
  voteType: z.enum(["upvote", "downvote"]),
}).refine(
  (data) => data.peopleId || data.resourceId || data.appId,
  {
    message: "Must specify peopleId, resourceId, or appId",
  }
);

export type CreateVoteInput = z.infer<typeof createVoteSchema>;

