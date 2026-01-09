import { NextRequest, NextResponse } from "next/server";
import { AppsService } from "@/lib/services/apps.service";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const appsService = new AppsService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const app = await appsService.findById(params.id);
    return success(app);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error("Internal server error", 500);
  }
}


