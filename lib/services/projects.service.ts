import { eq, and, gte, lt, inArray } from "drizzle-orm";
import { db } from "../db";
import { projects, likes, comments, users } from "../db/schema";
import { CreateProjectInput, UpdateProjectInput } from "../zod";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { randomBytes } from "crypto";

export class ProjectsService {
  async create(userId: string, data: CreateProjectInput) {
    const projectId = randomBytes(16).toString("hex");
    // Normalize data: convert empty strings to undefined for optional fields
    const { status: _, ...projectData } = data;
    const normalizedData = {
      ...projectData,
      githubLink: projectData.githubLink && projectData.githubLink !== "" ? projectData.githubLink : undefined,
      liveLink: projectData.liveLink && projectData.liveLink !== "" ? projectData.liveLink : undefined,
      projectImage: projectData.projectImage && projectData.projectImage !== "" ? projectData.projectImage : undefined,
    };
    // Construct insert values - explicitly list all fields to work around Drizzle type inference bug
    const [project] = await db
      .insert(projects)
      .values({
        id: projectId,
        title: normalizedData.title,
        tagline: normalizedData.tagline,
        description: normalizedData.description,
        githubLink: normalizedData.githubLink,
        liveLink: normalizedData.liveLink,
        projectImage: normalizedData.projectImage,
        tags: normalizedData.tags,
        authorId: userId,
        status: "published" as const,
      } as any)
      .returning();

    if (!project) {
      throw new Error("Failed to create project");
    }

    // Fetching author information
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResults.length > 0 ? userResults[0] : null;
    const author = user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    } : null;

    return {
      ...project,
      author,
    };
  }

  async findAll(limit = 50, offset = 0, week?: string) {
    let conditions: any[] = [];

    // Weekly filter: week format "YYYY-Www" (e.g., "2024-W01")
    if (week) {
      const [year, weekNum] = week.split("-W");
      if (year && weekNum) {
        const yearNum = parseInt(year);
        const weekNumber = parseInt(weekNum);
        
        // Computing ISO week boundaries
        // Getting January 1st of the year
        const jan1 = new Date(yearNum, 0, 1);
        // Getting day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = jan1.getDay();
        // Computing days to first Monday (ISO week starts on Monday)
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const firstMonday = new Date(jan1);
        firstMonday.setDate(jan1.getDate() + daysToMonday);
        
        // Computing start of requested week
        const weekStart = new Date(firstMonday);
        weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        conditions.push(gte(projects.createdAt, weekStart));
        conditions.push(lt(projects.createdAt, weekEnd));
      }
    }

    let query = db
      .select()
      .from(projects);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const projectResults = await query
      .limit(limit)
      .offset(offset)
      .orderBy(projects.createdAt);

    // Getting unique user IDs
    const userIds = [...new Set(projectResults.map(p => p.authorId))];
    
    // Fetching all users at once
    const userResults = userIds.length > 0
      ? await db
          .select()
          .from(users)
          .where(inArray(users.id, userIds))
      : [];

    // Creating map of users for quick lookup
    const userMap = new Map(userResults.map(u => [u.id, u]));

    // Returning projects with author info
    return projectResults.map((project) => {
      const user = userMap.get(project.authorId);
      const author = user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : null;

      return {
        ...project,
        author,
      };
    });
  }

  async findById(id: string) {
    const projectResults = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (projectResults.length === 0) {
      throw new NotFoundError("Project not found");
    }

    const project = projectResults[0]!;

    // Fetching author information
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, project.authorId))
      .limit(1);

    const user = userResults.length > 0 ? userResults[0] : null;
    const author = user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    } : null;

    return {
      ...project,
      author,
    };
  }

  async update(id: string, userId: string, data: UpdateProjectInput) {
    const project = await this.findById(id);

    if (project!.authorId !== userId) {
      throw new UnauthorizedError("You can only update your own projects");
    }

    // Type assertion to work around Drizzle type inference bug for updatedAt field
    const [updated] = await db
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      } as any)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Project not found");
    }

    // Fetching author information
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, updated.authorId))
      .limit(1);

    const user = userResults.length > 0 ? userResults[0] : null;
    const author = user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    } : null;

    return {
      ...updated,
      author,
    };
  }

  async delete(id: string, userId: string) {
    const project = await this.findById(id);

    if (project!.authorId !== userId) {
      throw new UnauthorizedError("You can only delete your own projects");
    }

    // Permanent delete: deleting associated likes and comments first
    await db.delete(likes).where(and(
      eq(likes.targetType, "project"),
      eq(likes.targetId, id)
    ));
    await db.delete(comments).where(and(
      eq(comments.targetType, "project"),
      eq(comments.targetId, id)
    ));
    
    // Then deleting the project
    await db.delete(projects).where(eq(projects.id, id));

    return { id, deleted: true };
  }

  async getUniqueTags() {
    const results = await db
      .select({ tags: projects.tags })
      .from(projects);
    
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

