import { NextRequest, NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { ResourcesService } from "@/lib/services/resources.service";
import { AppsService } from "@/lib/services/apps.service";
import { VotesService } from "@/lib/services/votes.service";
import { getCurrentUser } from "@/lib/middleware/auth";
import { success } from "@/lib/utils/responses";
import { db } from "@/lib/db";
import { people, resources, apps, projects, ideas, users } from "@/lib/db/schema";
import { sql, isNull } from "drizzle-orm";
import { getGitHubContributors } from "@/lib/github";

const peopleService = new PeopleService();
const resourcesService = new ResourcesService();
const appsService = new AppsService();
const votesService = new VotesService();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    // 1. Get pending submissions for voting (if any)
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

    // 2. Get contributors from DB sorted by most submissions
    // Get all users who have made submissions
    const allUsers = await db.select().from(users);
    
    // Get counts for each submission type (only people, resources, and apps)
    const [peopleSubmissions, resourcesSubmissions, appsSubmissions] = await Promise.all([
      db.select({
        userId: people.submittedBy,
        count: sql<number>`COUNT(*)::int`.as('count'),
      })
        .from(people)
        .where(isNull(people.deletedAt))
        .groupBy(people.submittedBy),
      db.select({
        userId: resources.submittedBy,
        count: sql<number>`COUNT(*)::int`.as('count'),
      })
        .from(resources)
        .where(isNull(resources.deletedAt))
        .groupBy(resources.submittedBy),
      db.select({
        userId: apps.submittedBy,
        count: sql<number>`COUNT(*)::int`.as('count'),
      })
        .from(apps)
        .where(isNull(apps.deletedAt))
        .groupBy(apps.submittedBy),
    ]);

    // Create maps for quick lookup
    const peopleMap = new Map(peopleSubmissions.map(p => [p.userId, p.count]));
    const resourcesMap = new Map(resourcesSubmissions.map(r => [r.userId, r.count]));
    const appsMap = new Map(appsSubmissions.map(a => [a.userId, a.count]));

    // Aggregate contributors with their counts (only people, resources, apps)
    const contributorsWithTotals = allUsers
      .map((user) => {
        const peopleCount = peopleMap.get(user.id) || 0;
        const resourcesCount = resourcesMap.get(user.id) || 0;
        const appsCount = appsMap.get(user.id) || 0;
        const totalSubmissions = peopleCount + resourcesCount + appsCount;

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          peopleCount,
          resourcesCount,
          appsCount,
          totalSubmissions,
        };
      })
      .filter(contributor => contributor.totalSubmissions > 0)
      .sort((a, b) => b.totalSubmissions - a.totalSubmissions);

    // 3. Get GitHub contributors
    let githubContributors: any[] = [];
    try {
      const response = await fetch(
        `https://api.github.com/repos/2xBuild/oneDB/contributors?per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 3600 },
        }
      );

      if (response.ok) {
        const contributors = await response.json();
        githubContributors = Array.isArray(contributors)
          ? contributors
              .filter((contributor: any) => contributor.type === "User")
              .map((contributor: any) => ({
                login: contributor.login,
                avatar: contributor.avatar_url,
                contributions: contributor.contributions,
                profileUrl: contributor.html_url,
              }))
              .sort((a: any, b: any) => b.contributions - a.contributions)
              .slice(0, 10) // Top 10 only
          : [];
      }
    } catch (error) {
      console.error("Error fetching GitHub contributors:", error);
    }

    return success({
      pendingSubmissions: {
        people: peopleWithVotes,
        resources: resourcesWithVotes,
        apps: appsWithVotes,
      },
      dbContributors: contributorsWithTotals,
      githubContributors,
    });
  } catch (err) {
    console.error("Error in contributors endpoint:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

