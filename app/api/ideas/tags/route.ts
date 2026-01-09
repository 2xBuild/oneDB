import { NextResponse } from "next/server";
import { IdeasService } from "@/lib/services/ideas.service";
import { success } from "@/lib/utils/responses";

const ideasService = new IdeasService();

export async function GET() {
  try {
    const tags = await ideasService.getUniqueTags();
    return success(tags);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

