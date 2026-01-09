import { NextResponse } from "next/server";
import { AppsService } from "@/lib/services/apps.service";
import { success } from "@/lib/utils/responses";

const appsService = new AppsService();

export async function GET() {
  try {
    const categories = await appsService.getUniqueCategories();
    return success(categories);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


