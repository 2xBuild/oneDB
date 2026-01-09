import { NextRequest, NextResponse } from "next/server";
import { IdeasService } from "@/lib/services/ideas.service";
import { requireAuth } from "@/lib/middleware/auth";
import { updateIdeaSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

const ideasService = new IdeasService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idea = await ideasService.findById(id);
    return success(idea);
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
    const validated = updateIdeaSchema.parse(body);
    const idea = await ideasService.update(id, user.id, validated);
    return success(idea);
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
    await ideasService.delete(id, user.id);
    return success({ message: "Idea deleted successfully" });
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

