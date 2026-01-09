import { NextRequest, NextResponse } from "next/server";
import { ResourcesService } from "@/lib/services/resources.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createResourceSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const resourcesService = new ResourcesService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category") || undefined;
    const tags = searchParams.get("tags")?.split(",") || undefined;
    const status = searchParams.get("status") || undefined;

    const filters = {
      category,
      tags,
      status,
    };

    const resources = await resourcesService.findAll(limit, offset, filters);
    return success(resources);
  } catch (err) {
    return error("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createResourceSchema.parse(body);
    const resource = await resourcesService.create(user.id, validated);
    return success(resource, 201);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    return error("Internal server error", 500);
  }
}


