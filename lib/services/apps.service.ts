import { eq, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import { apps } from "../db/schema";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { randomBytes } from "crypto";

export interface CreateAppInput {
  name: string;
  description?: string;
  url: string;
  category: string;
  tags?: string[];
  logo?: string;
}

// export interface UpdateAppInput {
//   name?: string;
//   description?: string;
//   url?: string;
//   category?: string;
//   tags?: string[];
//   logo?: string;
// }

export interface AppFilters {
  category?: string;
  tags?: string[];
  status?: string;
}

export class AppsService {
  async create(userId: string, data: CreateAppInput) {
    const appId = randomBytes(16).toString("hex");
    const [app] = await db
      .insert(apps)
      .values({
        id: appId,
        ...data,
        submittedBy: userId,
        status: "pending", // Requires community validation
      })
      .returning();

    return app;
  }

  async findAll(limit = 50, offset = 0, filters?: AppFilters) {
    // Build up all conditions in an array
    const conditions: any[] = [];

    // Only show approved items in main listing
    if (!filters?.status) {
      conditions.push(eq(apps.status, "approved"));
    } else {
      conditions.push(eq(apps.status, filters.status));
    }

    // Apply filters
    if (filters?.category) {
      conditions.push(eq(apps.category, filters.category));
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Filter by tags (array contains)
      const tagConditions = filters.tags.map((tag) =>
        sql`${tag} = ANY(${apps.tags})`
      );
      conditions.push(or(...tagConditions));
    }

    let query = db
      .select()
      .from(apps)
      .where(and(...conditions));

    const results = await query.limit(limit).offset(offset).orderBy(apps.createdAt);

    return results;
  }

  async findById(id: string) {
    const results = await db
      .select()
      .from(apps)
      .where(eq(apps.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundError("App not found");
    }

    return results[0];
  }

  // async update(id: string, userId: string, data: UpdateAppInput) {
  //   const app = await this.findById(id);

  //   // No owner restriction - community can update via voting
  //   // Owner check removed per requirement: apps are community-managed

  //   const [updated] = await db
  //     .update(apps)
  //     .set({
  //       ...data,
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(apps.id, id))
  //     .returning();

  //   return updated;
  // }

  // async delete(id: string, userId: string) {
  //   const app = await this.findById(id);

  //   // No owner restriction - community can delete via voting
  //   // Owner check removed per requirement: apps are community-managed

  //   // Soft delete (DB items use soft delete as they're subject to community approval)
  //   const [deleted] = await db
  //     .update(apps)
  //     .set({
  //       deletedAt: new Date(),
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(apps.id, id))
  //     .returning();

  //   return deleted;
  // }

  async findPending() {
    const results = await db
      .select()
      .from(apps)
      .where(eq(apps.status, "pending"))
      .orderBy(apps.createdAt);

    return results;
  }

  async approve(id: string) {
    const [updated] = await db
      .update(apps)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(apps.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    // Soft delete
    const [deleted] = await db
      .update(apps)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: "rejected",
      })
      .where(eq(apps.id, id))
      .returning();

    return deleted;
  }

  async getUniqueCategories() {
    const results = await db
      .select({ category: apps.category })
      .from(apps)
      .where(eq(apps.status, "approved"));
    
    const uniqueCategories = Array.from(
      new Set(results.map((r) => r.category).filter(Boolean))
    );
    
    return uniqueCategories.sort();
  }

  async getUniqueTags() {
    const results = await db
      .select({ tags: apps.tags })
      .from(apps)
      .where(eq(apps.status, "approved"));
    
    const allTags = new Set<string>();
    results.forEach((r) => {
      if (r.tags) {
        r.tags.forEach((tag) => allTags.add(tag));
      }
    });
    
    return Array.from(allTags).sort();
  }
}


