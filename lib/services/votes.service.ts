import { eq, and, sql } from "drizzle-orm";
import { db } from "../db";
import { votes, people, resources, apps } from "../db/schema";
import { NotFoundError } from "../utils/errors";
import { randomBytes } from "crypto";

export interface CreateVoteInput {
  peopleId?: string;
  resourceId?: string;
  appId?: string;
  voteType: "upvote" | "downvote";
}

export class VotesService {
  async vote(userId: string, data: CreateVoteInput) {
    // Verify that the submission exists
    if (data.peopleId) {
      const personList = await db
        .select()
        .from(people)
        .where(eq(people.id, data.peopleId))
        .limit(1);
      if (personList.length === 0) {
        throw new NotFoundError("Person not found");
      }
    } else if (data.resourceId) {
      const resourceList = await db
        .select()
        .from(resources)
        .where(eq(resources.id, data.resourceId))
        .limit(1);
      if (resourceList.length === 0) {
        throw new NotFoundError("Resource not found");
      }
    } else if (data.appId) {
      const appList = await db
        .select()
        .from(apps)
        .where(eq(apps.id, data.appId))
        .limit(1);
      if (appList.length === 0) {
        throw new NotFoundError("App not found");
      }
    } else {
      throw new Error("Must specify peopleId, resourceId, or appId");
    }

    // Check if user already voted
    let existingVote;
    if (data.peopleId) {
      const result = await db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.peopleId, data.peopleId)))
        .limit(1);
      existingVote = result[0];
    } else if (data.resourceId) {
      const result = await db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.resourceId, data.resourceId)))
        .limit(1);
      existingVote = result[0];
    } else if (data.appId) {
      const result = await db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.appId, data.appId)))
        .limit(1);
      existingVote = result[0];
    }

    if (existingVote) {
      // Update existing vote
      const [updated] = await db
        .update(votes)
        .set({ voteType: data.voteType })
        .where(eq(votes.id, existingVote.id))
        .returning();
      return updated;
    }

    // Create new vote
    const voteId = randomBytes(16).toString("hex");
    const [vote] = await db
      .insert(votes)
      .values({
        id: voteId,
        userId,
        peopleId: data.peopleId || null,
        resourceId: data.resourceId || null,
        appId: data.appId || null,
        voteType: data.voteType,
      })
      .returning();

    return vote;
  }

  async removeVote(userId: string, voteId: string) {
    const voteList = await db
      .select()
      .from(votes)
      .where(and(eq(votes.id, voteId), eq(votes.userId, userId)))
      .limit(1);

    if (voteList.length === 0) {
      throw new NotFoundError("Vote not found");
    }

    await db.delete(votes).where(eq(votes.id, voteId));
  }

  async getVotesForSubmission(
    peopleId?: string,
    resourceId?: string,
    appId?: string
  ) {
    let query = db.select().from(votes);

    if (peopleId) {
      query = query.where(eq(votes.peopleId, peopleId)) as any;
    } else if (resourceId) {
      query = query.where(eq(votes.resourceId, resourceId)) as any;
    } else if (appId) {
      query = query.where(eq(votes.appId, appId)) as any;
    } else {
      return { upvotes: 0, downvotes: 0, total: 0 };
    }

    const allVotes = await query;

    const upvotes = allVotes.filter((v) => v.voteType === "upvote").length;
    const downvotes = allVotes.filter((v) => v.voteType === "downvote").length;

    return {
      upvotes,
      downvotes,
      total: allVotes.length,
      percentage: allVotes.length > 0 ? (upvotes / allVotes.length) * 100 : 0,
    };
  }

  async checkApprovalStatus(
    peopleId?: string,
    resourceId?: string,
    appId?: string,
    minVotes = 50, // Minimum 50 total votes required
    ratioThreshold = 3 // Upvotes must be at least 3x downvotes
  ) {
    const voteStats = await this.getVotesForSubmission(peopleId, resourceId, appId);

    // Check both requirements:
    // 1. Minimum 50 total votes (upvotes + downvotes >= 50)
    // 2. 3x ratio: upvotes >= 3 * downvotes
    const meetsMinVotes = voteStats.total >= minVotes;
    const meetsRatio = voteStats.downvotes === 0 
      ? voteStats.upvotes >= minVotes // If no downvotes, need minimum upvotes
      : voteStats.upvotes >= ratioThreshold * voteStats.downvotes;
    
    const approved = meetsMinVotes && meetsRatio;

    // Calculate how many more votes needed
    let votesNeededForMin = 0;
    let votesNeededForRatio = 0;
    
    if (!meetsMinVotes) {
      votesNeededForMin = minVotes - voteStats.total;
    }
    
    if (!meetsRatio) {
      if (voteStats.downvotes === 0) {
        // Need minimum upvotes
        votesNeededForRatio = Math.max(0, minVotes - voteStats.upvotes);
      } else {
        // Need upvotes to be 3x downvotes
        const requiredUpvotes = ratioThreshold * voteStats.downvotes;
        votesNeededForRatio = Math.max(0, requiredUpvotes - voteStats.upvotes);
      }
    }
    
    // Total votes needed is the maximum of both requirements
    const votesNeeded = Math.max(votesNeededForMin, votesNeededForRatio);

    return {
      approved,
      ...voteStats,
      minVotes,
      ratioThreshold,
      votesNeededForMin,
      votesNeededForRatio,
      votesNeeded,
      meetsMinVotes,
      meetsRatio,
      // Keep old fields for backward compatibility
      threshold: minVotes,
      percentageThreshold: 75, // Approximate for 3:1 ratio
      votesNeededForThreshold: votesNeeded,
      votesNeededForPercentage: votesNeeded,
      meetsThreshold: approved,
      meetsPercentage: approved,
    };
  }

  async getUserVote(
    userId: string,
    peopleId?: string,
    resourceId?: string,
    appId?: string
  ) {
    if (!peopleId && !resourceId && !appId) {
      return null;
    }

    let condition;
    if (peopleId) {
      condition = and(eq(votes.userId, userId), eq(votes.peopleId, peopleId));
    } else if (resourceId) {
      condition = and(eq(votes.userId, userId), eq(votes.resourceId, resourceId));
    } else if (appId) {
      condition = and(eq(votes.userId, userId), eq(votes.appId, appId));
    } else {
      return null;
    }

    const result = await db
      .select()
      .from(votes)
      .where(condition)
      .limit(1);
    
    return result[0] || null;
  }
}


