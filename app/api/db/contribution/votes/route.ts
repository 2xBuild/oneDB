import { NextRequest, NextResponse } from "next/server";
import { VotesService } from "@/lib/services/votes.service";
import { PeopleService } from "@/lib/services/people.service";
import { ResourcesService } from "@/lib/services/resources.service";
import { AppsService } from "@/lib/services/apps.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createVoteSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";

const votesService = new VotesService();
const peopleService = new PeopleService();
const resourcesService = new ResourcesService();
const appsService = new AppsService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createVoteSchema.parse(body);

    const vote = await votesService.vote(user.id, validated);

    // Check if submission should be approved (50 votes minimum + 3x upvote ratio)
    const approvalStatus = await votesService.checkApprovalStatus(
      validated.peopleId,
      validated.resourceId,
      validated.appId,
      50, // Minimum 50 votes
      3   // Upvotes must be 3x downvotes
    );

    // Auto-approve if threshold met (50 votes OR admin approval - admin approval handled separately)
    if (approvalStatus.approved) {
      if (validated.peopleId) {
        await peopleService.approve(validated.peopleId);
      } else if (validated.resourceId) {
        await resourcesService.approve(validated.resourceId);
      } else if (validated.appId) {
        await appsService.approve(validated.appId);
      }
    }

    return success({ vote, approvalStatus }, 201);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    return error("Internal server error", 500);
  }
}


