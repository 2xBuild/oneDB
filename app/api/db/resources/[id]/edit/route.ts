import { NextRequest, NextResponse } from "next/server";
import { ResourcesService } from "@/lib/services/resources.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createResourceSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";

const resourcesService = new ResourcesService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createResourceSchema.parse(body);
    const contribution = await resourcesService.submitEdit(user.id, params.id, validated);
    return success(contribution, 201);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    if (err instanceof Error && err.message.includes("Can only edit")) {
      return error(err.message, 400);
    }
    return error("Internal server error", 500);
  }
}

