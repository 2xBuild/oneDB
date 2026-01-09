import { NextRequest, NextResponse } from "next/server";
import { ResourcesService } from "@/lib/services/resources.service";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const resourcesService = new ResourcesService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await resourcesService.findById(id);
    return success(resource);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error("Internal server error", 500);
  }
}


