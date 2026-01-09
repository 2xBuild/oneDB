import { eq, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import { resources } from "../db/schema";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { randomBytes } from "crypto";

export interface CreateResourceInput {
  title: string;
  description?: string;
  url: string;
  category: string;
  tags?: string[];
  image?: string;
}

// export interface UpdateResourceInput {
//   title?: string;
//   description?: string;
//   url?: string;
//   category?: string;
//   tags?: string[];
//   image?: string;
// }

export interface ResourceFilters {
  category?: string;
  tags?: string[];
  status?: string;
}

export class ResourcesService {
  async create(userId: string, data: CreateResourceInput) {
    const resourceId = randomBytes(16).toString("hex");
    const [resource] = await db
      .insert(resources)
      .values({
        id: resourceId,
        ...data,
        submittedBy: userId,
        status: "pending", // Requires community validation
      })
      .returning();

    return resource;
  }

  async findAll(limit = 50, offset = 0, filters?: ResourceFilters) {
    // Build up all conditions in an array
    const conditions: any[] = [];

    // Only show approved items in main listing
    if (!filters?.status) {
      conditions.push(eq(resources.status, "approved"));
    } else {
      conditions.push(eq(resources.status, filters.status));
    }

    // Apply filters
    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Filter by tags (array contains)
      const tagConditions = filters.tags.map((tag) =>
        sql`${tag} = ANY(${resources.tags})`
      );
      conditions.push(or(...tagConditions));
    }

    let query = db
      .select()
      .from(resources)
      .where(and(...conditions));

    const results = await query.limit(limit).offset(offset).orderBy(resources.createdAt);

    return results;
  }

  async findById(id: string) {
    const results = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundError("Resource not found");
    }

    return results[0];
  }

  // async update(id: string, userId: string, data: UpdateResourceInput) {
  //   const resource = await this.findById(id);

  //   // No owner restriction - community can update via voting
  //   // Owner check removed per requirement: resources are community-managed

  //   const [updated] = await db
  //     .update(resources)
  //     .set({
  //       ...data,
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(resources.id, id))
  //     .returning();

  //   return updated;
  // }

  // async delete(id: string, userId: string) {
  //   const resource = await this.findById(id);

  //   // No owner restriction - community can delete via voting
  //   // Owner check removed per requirement: resources are community-managed

  //   // Soft delete (DB items use soft delete as they're subject to community approval)
  //   const [deleted] = await db
  //     .update(resources)
  //     .set({
  //       deletedAt: new Date(),
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(resources.id, id))
  //     .returning();

  //   return deleted;
  // }

  async findPending() {
    const results = await db
      .select()
      .from(resources)
      .where(eq(resources.status, "pending"))
      .orderBy(resources.createdAt);

    return results;
  }

  async approve(id: string) {
    const [updated] = await db
      .update(resources)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();

    return updated;
  }

  async getUniqueCategories() {
    const results = await db
      .select({ category: resources.category })
      .from(resources)
      .where(eq(resources.status, "approved"));
    
    const uniqueCategories = Array.from(
      new Set(results.map((r) => r.category).filter(Boolean))
    );
    
    return uniqueCategories.sort();
  }

  async getUniqueTags() {
    const results = await db
      .select({ tags: resources.tags })
      .from(resources)
      .where(eq(resources.status, "approved"));
    
    const allTags = new Set<string>();
    results.forEach((r) => {
      if (r.tags) {
        r.tags.forEach((tag) => allTags.add(tag));
      }
    });
    
    return Array.from(allTags).sort();
  }
}


