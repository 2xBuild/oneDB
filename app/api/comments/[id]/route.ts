import { NextRequest, NextResponse } from "next/server";
import { CommentsService } from "@/lib/services/comments.service";
import { requireAuth } from "@/lib/middleware/auth";
import { updateCommentSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

const commentsService = new CommentsService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comment = await commentsService.findById(id);
    return success(comment);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const body = await request.json();
    const validated = updateCommentSchema.parse(body);
    const comment = await commentsService.update(id, user.id, validated);
    return success(comment);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    if (err instanceof UnauthorizedError) {
      return error(err.message, 403);
    }
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    return error("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    await commentsService.delete(id, user.id);
    return success({ message: "Comment deleted successfully" });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    if (err instanceof UnauthorizedError) {
      return error(err.message, 403);
    }
    return error("Internal server error", 500);
  }
}

