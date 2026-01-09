import { eq, and, or, inArray } from "drizzle-orm";
import { db } from "../db";
import { comments, projects, ideas, users } from "../db/schema";
import { CreateCommentInput, UpdateCommentInput } from "../zod";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { randomBytes } from "crypto";

export class CommentsService {
  async create(userId: string, data: CreateCommentInput) {
    // Verifying that project or idea exists
    if (data.targetType === "project") {
      const projectList = await db
        .select()
        .from(projects)
        .where(eq(projects.id, data.targetId))
        .limit(1);
      if (projectList.length === 0) {
        throw new NotFoundError("Project not found");
      }
    } else if (data.targetType === "idea") {
      const ideaList = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, data.targetId))
        .limit(1);
      if (ideaList.length === 0) {
        throw new NotFoundError("Idea not found");
      }
    }

    // If parentId provided, verifying parent comment exists
    if (data.parentId) {
      const parentComment = await this.findById(data.parentId);
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }
    }

    const commentId = randomBytes(16).toString("hex");
    const [comment] = await db
      .insert(comments)
      .values({
        id: commentId,
        content: data.content,
        authorId: userId,
        targetType: data.targetType,
        targetId: data.targetId,
        parentId: data.parentId || null,
      })
      .returning();

    // Fetching user to include in response
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResults.length > 0 ? userResults[0] : null;

    return {
      ...comment,
      author: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : null,
    };
  }

  async findByProject(projectId: string) {
    const commentResults = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.targetType, "project"),
        eq(comments.targetId, projectId)
      ))
      .orderBy(comments.createdAt);

    // Getting unique user IDs
    const userIds = [...new Set(commentResults.map(c => c.authorId))];
    
    // Fetching all users at once
    const userResults = userIds.length > 0
      ? await db
          .select()
          .from(users)
          .where(inArray(users.id, userIds))
      : [];

    // Creating map of users for quick lookup
    const userMap = new Map(userResults.map(u => [u.id, u]));

    // Debug logging
    console.log(`[findByProject] Found ${commentResults.length} comments for project ${projectId}`);
    console.log(`[findByProject] Found ${userResults.length} users`);
    console.log(`[findByProject] User IDs in comments:`, userIds);
    console.log(`[findByProject] User IDs found:`, userResults.map(u => u?.id).filter(Boolean));

    // Returning flat array with author info - frontend builds the tree
    const result = commentResults.map((comment) => {
      const user = userMap.get(comment.authorId);
      const author = user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : null;
      
      if (!author) {
        console.warn(`[findByProject] Comment ${comment.id} has no author. authorId: ${comment.authorId}`);
      }
      
      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        targetType: comment.targetType,
        targetId: comment.targetId,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        isEdited: comment.isEdited,
        author,
      };
    });
    
    console.log(`[findByProject] Returning ${result.length} comments`);
    if (result.length > 0 && result[0]) {
      console.log(`[findByProject] First comment author:`, result[0].author);
    }
    
    return result;
  }

  async findByIdea(ideaId: string) {
    const commentResults = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.targetType, "idea"),
        eq(comments.targetId, ideaId)
      ))
      .orderBy(comments.createdAt);

    // Getting unique user IDs
    const userIds = [...new Set(commentResults.map(c => c.authorId))];
    
    // Fetching all users at once
    const userResults = userIds.length > 0
      ? await db
          .select()
          .from(users)
          .where(inArray(users.id, userIds))
      : [];

    // Creating map of users for quick lookup
    const userMap = new Map(userResults.map(u => [u.id, u]));

    // Debug logging
    console.log(`[findByIdea] Found ${commentResults.length} comments for idea ${ideaId}`);
    console.log(`[findByIdea] Found ${userResults.length} users`);
    console.log(`[findByIdea] User IDs in comments:`, userIds);
    console.log(`[findByIdea] User IDs found:`, userResults.map(u => u?.id).filter(Boolean));

    // Returning flat array with author info - frontend builds the tree
    const result = commentResults.map((comment) => {
      const user = userMap.get(comment.authorId);
      const author = user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : null;
      
      if (!author) {
        console.warn(`[findByIdea] Comment ${comment.id} has no author. authorId: ${comment.authorId}`);
      }
      
      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        targetType: comment.targetType,
        targetId: comment.targetId,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        isEdited: comment.isEdited,
        author,
      };
    });
    
    console.log(`[findByIdea] Returning ${result.length} comments`);
    if (result.length > 0 && result[0]) {
      console.log(`[findByIdea] First comment author:`, result[0].author);
    }
    
    return result;
  }

  // Comment tree building handled in frontend; backend returns flat array with author info

  async findById(id: string) {
    const commentResults = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (commentResults.length === 0) {
      throw new NotFoundError("Comment not found");
    }

    const comment = commentResults[0];
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }
    
    // Fetching user
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, comment.authorId))
      .limit(1);

    const user = userResults.length > 0 ? userResults[0] : null;

    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      targetType: comment.targetType,
      targetId: comment.targetId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      isEdited: comment.isEdited,
      author: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : null,
    };
  }

  async update(id: string, userId: string, data: UpdateCommentInput) {
    const comment = await this.findById(id);

    if (comment!.authorId !== userId) {
      throw new UnauthorizedError("You can only update your own comments");
    }

    const [updated] = await db
      .update(comments)
      .set({
        content: data.content,
        isEdited: true, // Mark as edited
      })
      .where(eq(comments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Comment not found");
    }

    // Fetching user to include in response
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, updated.authorId))
      .limit(1);

    const user = userResults.length > 0 ? userResults[0] : null;

    return {
      ...updated,
      author: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : null,
    };
  }

  async delete(id: string, userId: string) {
    const comment = await this.findById(id);

    if (comment!.authorId !== userId) {
      throw new UnauthorizedError("You can only delete your own comments");
    }

    // Permanent delete: deleting all child comments (replies) first
    // Recursively deleting all nested comments
    const deleteReplies = async (parentId: string) => {
      const replies = await db
        .select()
        .from(comments)
        .where(eq(comments.parentId, parentId));
      
      for (const reply of replies) {
        await deleteReplies(reply.id);
        await db.delete(comments).where(eq(comments.id, reply.id));
      }
    };

    await deleteReplies(id);
    
    // Then deleting the comment itself
    await db.delete(comments).where(eq(comments.id, id));

    return { id, deleted: true };
  }
}

