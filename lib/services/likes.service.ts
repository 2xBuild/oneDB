import { eq, and, sql } from "drizzle-orm";
import { db } from "../db";
import { likes, projects, ideas, people, resources, apps } from "../db/schema";
import { NotFoundError } from "../utils/errors";
import { randomBytes } from "crypto";

type TargetType = "project" | "idea" | "person" | "resource" | "app";

export class LikesService {
  private async verifyTargetExists(targetType: TargetType, targetId: string) {
    let exists = false;
    switch (targetType) {
      case "project":
        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, targetId))
          .limit(1);
        exists = projectList.length > 0;
        break;
      case "idea":
        const ideaList = await db
          .select()
          .from(ideas)
          .where(eq(ideas.id, targetId))
          .limit(1);
        exists = ideaList.length > 0;
        break;
      case "person":
        const personList = await db
          .select()
          .from(people)
          .where(eq(people.id, targetId))
          .limit(1);
        exists = personList.length > 0;
        break;
      case "resource":
        const resourceList = await db
          .select()
          .from(resources)
          .where(eq(resources.id, targetId))
          .limit(1);
        exists = resourceList.length > 0;
        break;
      case "app":
        const appList = await db
          .select()
          .from(apps)
          .where(eq(apps.id, targetId))
          .limit(1);
        exists = appList.length > 0;
        break;
    }

    if (!exists) {
      const entityName = targetType.charAt(0).toUpperCase() + targetType.slice(1);
      throw new NotFoundError(`${entityName} not found`);
    }
  }

  async like(userId: string, targetType: TargetType, targetId: string, isLike: boolean) {
    // Verify target exists
    await this.verifyTargetExists(targetType, targetId);

    // Check if user already liked/disliked this target
    const existingLikes = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.targetType, targetType),
          eq(likes.targetId, targetId)
        )
      )
      .limit(1);

    if (existingLikes.length > 0) {
      // Update existing like/dislike
      const [updated] = await db
        .update(likes)
        .set({ isLike })
        .where(eq(likes.id, existingLikes[0]?.id || ""))
        .returning();
      return updated;
    }

    // Create new like/dislike
    const likeId = randomBytes(16).toString("hex");
    const [like] = await db
      .insert(likes)
      .values({
        id: likeId,
        userId,
        targetType,
        targetId,
        isLike,
      })
      .returning();

    return like;
  }

  async unlike(userId: string, targetType: TargetType, targetId: string) {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.targetType, targetType),
          eq(likes.targetId, targetId)
        )
      );
  }

  async getLikeAggregation(targetType: TargetType, targetId: string) {
    const result = await db
      .select({
        likes: sql<number>`COALESCE(SUM(CASE WHEN ${likes.isLike} = true THEN 1 ELSE 0 END), 0)`,
        dislikes: sql<number>`COALESCE(SUM(CASE WHEN ${likes.isLike} = false THEN 1 ELSE 0 END), 0)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(likes)
      .where(and(eq(likes.targetType, targetType), eq(likes.targetId, targetId)));

    return result[0] || { likes: 0, dislikes: 0, total: 0 };
  }

  async getUserLike(userId: string, targetType: TargetType, targetId: string) {
    const result = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.targetType, targetType),
          eq(likes.targetId, targetId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  // Convenience methods for backward compatibility
  async likeProject(userId: string, projectId: string, isLike: boolean) {
    return this.like(userId, "project", projectId, isLike);
  }

  async likeIdea(userId: string, ideaId: string, isLike: boolean) {
    return this.like(userId, "idea", ideaId, isLike);
  }

  async likePerson(userId: string, personId: string, isLike: boolean) {
    return this.like(userId, "person", personId, isLike);
  }

  async likeResource(userId: string, resourceId: string, isLike: boolean) {
    return this.like(userId, "resource", resourceId, isLike);
  }

  async likeApp(userId: string, appId: string, isLike: boolean) {
    return this.like(userId, "app", appId, isLike);
  }

  async unlikeProject(userId: string, projectId: string) {
    return this.unlike(userId, "project", projectId);
  }

  async unlikeIdea(userId: string, ideaId: string) {
    return this.unlike(userId, "idea", ideaId);
  }

  async unlikePerson(userId: string, personId: string) {
    return this.unlike(userId, "person", personId);
  }

  async unlikeResource(userId: string, resourceId: string) {
    return this.unlike(userId, "resource", resourceId);
  }

  async unlikeApp(userId: string, appId: string) {
    return this.unlike(userId, "app", appId);
  }

  async getProjectLikeAggregation(projectId: string) {
    return this.getLikeAggregation("project", projectId);
  }

  async getIdeaLikeAggregation(ideaId: string) {
    return this.getLikeAggregation("idea", ideaId);
  }

  async getPersonLikeAggregation(personId: string) {
    return this.getLikeAggregation("person", personId);
  }

  async getResourceLikeAggregation(resourceId: string) {
    return this.getLikeAggregation("resource", resourceId);
  }

  async getAppLikeAggregation(appId: string) {
    return this.getLikeAggregation("app", appId);
  }

  async getUserLikeForProject(userId: string, projectId: string) {
    return this.getUserLike(userId, "project", projectId);
  }

  async getUserLikeForIdea(userId: string, ideaId: string) {
    return this.getUserLike(userId, "idea", ideaId);
  }

  async getUserLikeForPerson(userId: string, personId: string) {
    return this.getUserLike(userId, "person", personId);
  }

  async getUserLikeForResource(userId: string, resourceId: string) {
    return this.getUserLike(userId, "resource", resourceId);
  }

  async getUserLikeForApp(userId: string, appId: string) {
    return this.getUserLike(userId, "app", appId);
  }
}

