import { NextRequest, NextResponse } from "next/server";
import { AppsService } from "@/lib/services/apps.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createAppSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";

const appsService = new AppsService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createAppSchema.parse(body);
    const contribution = await appsService.submitEdit(user.id, params.id, validated);
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

