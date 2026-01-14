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
    
    // Get the contribution to determine reqType from contributionType
    let contributionType: string | null = null;
    if (body.peopleId) {
      const person = await peopleService.findById(body.peopleId);
      contributionType = person.contributionType || "new";
    } else if (body.resourceId) {
      const resource = await resourcesService.findById(body.resourceId);
      contributionType = resource.contributionType || "new";
    } else if (body.appId) {
      const app = await appsService.findById(body.appId);
      contributionType = app.contributionType || "new";
    }
    
    // Map contributionType to reqType: "new" -> "add", "edit" -> "edit", "delete" -> "delete"
    const reqType = contributionType === "new" ? "add" : (contributionType === "edit" ? "edit" : "delete");
    
    const bodyWithReqType = { ...body, reqType };
    const validated = createVoteSchema.parse(bodyWithReqType);

    // reqType is always set by the route handler above, so we can safely assert it's present
    const vote = await votesService.vote(user.id, {
      ...validated,
      reqType: reqType as "add" | "edit" | "delete",
    });

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


