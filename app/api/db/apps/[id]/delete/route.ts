import { NextRequest, NextResponse } from "next/server";
import { AppsService } from "@/lib/services/apps.service";
import { requireAuth } from "@/lib/middleware/auth";
import { success, error } from "@/lib/utils/responses";

const appsService = new AppsService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const contribution = await appsService.submitDelete(user.id, id);
    return success(contribution, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Can only delete")) {
      return error(err.message, 400);
    }
    return error("Internal server error", 500);
  }
}

