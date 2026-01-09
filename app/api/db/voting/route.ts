import { NextRequest, NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { ResourcesService } from "@/lib/services/resources.service";
import { AppsService } from "@/lib/services/apps.service";
import { VotesService } from "@/lib/services/votes.service";
import { getCurrentUser } from "@/lib/middleware/auth";
import { success } from "@/lib/utils/responses";

const peopleService = new PeopleService();
const resourcesService = new ResourcesService();
const appsService = new AppsService();
const votesService = new VotesService();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    const [pendingPeople, pendingResources, pendingApps] = await Promise.all([
      peopleService.findPending(),
      resourcesService.findPending(),
      appsService.findPending(),
    ]);

    // Get vote counts, user vote status, and approval requirements for each submission
    const peopleWithVotes = await Promise.all(
      pendingPeople.map(async (person) => {
        const votes = await votesService.getVotesForSubmission(person.id);
        const approvalStatus = await votesService.checkApprovalStatus(person.id);
        const userVote = userId
          ? await votesService.getUserVote(userId, person.id)
          : null;
        return {
          ...person,
          votes,
          approvalStatus,
          userVote: userVote ? { id: userVote.id, voteType: userVote.voteType } : null,
        };
      })
    );

    const resourcesWithVotes = await Promise.all(
      pendingResources.map(async (resource) => {
        const votes = await votesService.getVotesForSubmission(undefined, resource.id);
        const approvalStatus = await votesService.checkApprovalStatus(undefined, resource.id);
        const userVote = userId
          ? await votesService.getUserVote(userId, undefined, resource.id)
          : null;
        return {
          ...resource,
          votes,
          approvalStatus,
          userVote: userVote ? { id: userVote.id, voteType: userVote.voteType } : null,
        };
      })
    );

    const appsWithVotes = await Promise.all(
      pendingApps.map(async (app) => {
        const votes = await votesService.getVotesForSubmission(undefined, undefined, app.id);
        const approvalStatus = await votesService.checkApprovalStatus(undefined, undefined, app.id);
        const userVote = userId
          ? await votesService.getUserVote(userId, undefined, undefined, app.id)
          : null;
        return {
          ...app,
          votes,
          approvalStatus,
          userVote: userVote ? { id: userVote.id, voteType: userVote.voteType } : null,
        };
      })
    );

    return success({
      people: peopleWithVotes,
      resources: resourcesWithVotes,
      apps: appsWithVotes,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


