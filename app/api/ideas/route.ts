import { NextRequest, NextResponse } from "next/server";
import { IdeasService } from "@/lib/services/ideas.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createIdeaSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

const ideasService = new IdeasService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const week = searchParams.get("week") || undefined;

    const ideas = await ideasService.findAll(limit, offset, week);
    return success(ideas);
  } catch (err) {
    return error("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createIdeaSchema.parse(body);
    const idea = await ideasService.create(user.id, validated);
    return success(idea, 201);
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

