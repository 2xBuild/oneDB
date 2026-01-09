import { NextRequest, NextResponse } from "next/server";
import { ProjectsService } from "@/lib/services/projects.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createProjectSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

const projectsService = new ProjectsService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const week = searchParams.get("week") || undefined;

    const projects = await projectsService.findAll(limit, offset, week);
    return success(projects);
  } catch (err) {
    return error("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createProjectSchema.parse(body);
    const project = await projectsService.create(user.id, validated);
    return success(project, 201);
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return error("Unauthorized", 401);
    }
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    return error("Internal server error", 500);
  }
}

