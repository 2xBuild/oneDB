import { NextResponse } from "next/server";
import { ResourcesService } from "@/lib/services/resources.service";
import { success } from "@/lib/utils/responses";

const resourcesService = new ResourcesService();

export async function GET() {
  try {
    const categories = await resourcesService.getUniqueCategories();
    return success(categories);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


