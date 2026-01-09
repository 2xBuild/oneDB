import { NextResponse } from "next/server";
import { ResourcesService } from "@/lib/services/resources.service";
import { success } from "@/lib/utils/responses";

const resourcesService = new ResourcesService();

export async function GET() {
  try {
    const tags = await resourcesService.getUniqueTags();
    return success(tags);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


