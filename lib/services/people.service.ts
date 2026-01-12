import { eq, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import { people } from "../db/schema";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { normalizePlatformName } from "../utils/platform";
import { randomBytes } from "crypto";

export interface CreatePeopleInput {
  name: string;
  description?: string;
  socialMediaPlatform: string;
  socialMediaLink: string;
  tags?: string[];
  image?: string;
  followersCount?: number;
}

// export interface UpdatePeopleInput {
//   name?: string;
//   description?: string;
//   socialMediaPlatform?: string;
//   socialMediaLink?: string;
//   tags?: string[];
//   image?: string;
// }

export interface PeopleFilters {
  platform?: string;
  tags?: string[];
  status?: string;
}

export class PeopleService {
  async create(userId: string, data: CreatePeopleInput) {
    const peopleId = randomBytes(16).toString("hex");
    const [person] = await db
      .insert(people)
      .values({
        id: peopleId,
        ...data,
        socialMediaPlatform: normalizePlatformName(data.socialMediaPlatform),
        submittedBy: userId,
        status: "pending", // Requires community validation
      })
      .returning();

    return person;
  }

  async findAll(limit = 50, offset = 0, filters?: PeopleFilters) {
    // Build up all conditions in an array
    const conditions: any[] = [];

    // Only show approved items in main listing
    if (!filters?.status) {
      conditions.push(eq(people.status, "approved"));
    } else {
      conditions.push(eq(people.status, filters.status));
    }

    // Apply filters
    if (filters?.platform) {
      // Normalize platform name for filtering
      const normalizedPlatform = normalizePlatformName(filters.platform);
      conditions.push(eq(people.socialMediaPlatform, normalizedPlatform));
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Filter by tags (array contains)
      const tagConditions = filters.tags.map((tag) =>
        sql`${tag} = ANY(${people.tags})`
      );
      conditions.push(or(...tagConditions));
    }

    let query = db
      .select()
      .from(people)
      .where(and(...conditions));

    const results = await query.limit(limit).offset(offset).orderBy(people.createdAt);

    return results;
  }

  async findById(id: string) {
    const results = await db
      .select()
      .from(people)
      .where(eq(people.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundError("Person not found");
    }

    return results[0];
  }

  // async update(id: string, userId: string, data: UpdatePeopleInput) {
  //   const person = await this.findById(id);

  //   // No owner restriction - community can update via voting
  //   // Owner check removed per requirement: people are community-managed

  //   const [updated] = await db
  //     .update(people)
  //     .set({
  //       ...data,
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(people.id, id))
  //     .returning();

  //   return updated;
  // }

  // async delete(id: string, userId: string) {
  //   const person = await this.findById(id);

  //   // No owner restriction - community can delete via voting
  //   // Owner check removed per requirement: people are community-managed

  //   // Soft delete (DB items use soft delete as they're subject to community approval)
  //   const [deleted] = await db
  //     .update(people)
  //     .set({
  //       deletedAt: new Date(),
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(people.id, id))
  //     .returning();

  //   return deleted;
  // }

  async findPending() {
    const results = await db
      .select()
      .from(people)
      .where(eq(people.status, "pending"))
      .orderBy(people.createdAt);

    return results;
  }

  async approve(id: string) {
    const contribution = await this.findById(id);
    
    if (contribution.contributionType === "edit" && contribution.originalId) {
      const original = await this.findById(contribution.originalId);
      if (original.status !== "approved") {
        throw new Error("Cannot edit a non-approved item");
      }
      
      await db
        .update(people)
        .set({
          name: contribution.name,
          description: contribution.description,
          socialMediaPlatform: contribution.socialMediaPlatform,
          socialMediaLink: contribution.socialMediaLink,
          tags: contribution.tags,
          image: contribution.image,
          followersCount: contribution.followersCount,
          updatedAt: new Date(),
        })
        .where(eq(people.id, contribution.originalId));
      
      await db.delete(people).where(eq(people.id, id));
      return { id, approved: true };
    }
    
    if (contribution.contributionType === "delete" && contribution.originalId) {
      const original = await this.findById(contribution.originalId);
      if (original.status !== "approved") {
        throw new Error("Cannot delete a non-approved item");
      }
      
      await db.delete(people).where(eq(people.id, contribution.originalId));
      await db.delete(people).where(eq(people.id, id));
      return { id, deleted: true };
    }
    
    const [updated] = await db
      .update(people)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(people.id, id))
      .returning();

    return updated;
  }
  
  async submitEdit(userId: string, originalId: string, data: CreatePeopleInput) {
    const original = await this.findById(originalId);
    if (original.status !== "approved") {
      throw new Error("Can only edit approved items");
    }
    
    const contributionId = randomBytes(16).toString("hex");
    const [contribution] = await db
      .insert(people)
      .values({
        id: contributionId,
        ...data,
        socialMediaPlatform: normalizePlatformName(data.socialMediaPlatform),
        submittedBy: userId,
        status: "pending",
        contributionType: "edit",
        originalId: originalId,
      })
      .returning();
    
    return contribution;
  }
  
  async submitDelete(userId: string, originalId: string) {
    const original = await this.findById(originalId);
    if (original.status !== "approved") {
      throw new Error("Can only delete approved items");
    }
    
    const contributionId = randomBytes(16).toString("hex");
    const [contribution] = await db
      .insert(people)
      .values({
        id: contributionId,
        name: original.name, // Keep original data for display
        description: original.description,
        socialMediaPlatform: original.socialMediaPlatform,
        socialMediaLink: original.socialMediaLink,
        tags: original.tags,
        image: original.image,
        followersCount: original.followersCount,
        submittedBy: userId,
        status: "pending",
        contributionType: "delete",
        originalId: originalId,
      })
      .returning();
    
    return contribution;
  }

  async delete(id: string) {
    await db.delete(people).where(eq(people.id, id));
    return { id, deleted: true };
  }

  async getUniquePlatforms() {
    const results = await db
      .select({ platform: people.socialMediaPlatform })
      .from(people)
      .where(eq(people.status, "approved"));
    
    const uniquePlatforms = Array.from(
      new Set(results.map((r) => r.platform).filter(Boolean))
    );
    
    return uniquePlatforms.sort();
  }

  async getUniqueTags() {
    const results = await db
      .select({ tags: people.tags })
      .from(people)
      .where(eq(people.status, "approved"));
    
    const allTags = new Set<string>();
    results.forEach((r) => {
      if (r.tags) {
        r.tags.forEach((tag) => allTags.add(tag));
      }
    });
    
    // Getting tag counts to sort by popularity
    const tagCounts = new Map<string, number>();
    results.forEach((r) => {
      if (r.tags) {
        r.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    // Sorting by count (descending) then alphabetically
    const uniqueTags = Array.from(tagCounts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]; // Sort by count first
        return a[0].localeCompare(b[0]); // Then alphabetically
      })
      .map(([tag]) => tag);
    
    return uniqueTags;
  }
}


