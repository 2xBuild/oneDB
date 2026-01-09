import { NextResponse } from "next/server";
import { AppsService } from "@/lib/services/apps.service";
import { success } from "@/lib/utils/responses";

const appsService = new AppsService();

export async function GET() {
  try {
    const tags = await appsService.getUniqueTags();
    return success(tags);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


