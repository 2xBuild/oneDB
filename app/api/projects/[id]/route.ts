import { NextRequest, NextResponse } from "next/server";
import { ProjectsService } from "@/lib/services/projects.service";
import { requireAuth } from "@/lib/middleware/auth";
import { updateProjectSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

const projectsService = new ProjectsService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await projectsService.findById(params.id);
    return success(project);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);
    const project = await projectsService.update(params.id, user.id, validated);
    return success(project);
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await projectsService.delete(params.id, user.id);
    return success({ message: "Project deleted successfully" });
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

