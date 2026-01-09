import { NextRequest, NextResponse } from "next/server";
import { CommentsService } from "@/lib/services/comments.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createCommentSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const commentsService = new CommentsService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createCommentSchema.parse(body);
    const comment = await commentsService.create(user.id, validated);
    return success(comment, 201);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    return error("Internal server error", 500);
  }
}

