import { NextResponse } from "next/server";
import { ProjectsService } from "@/lib/services/projects.service";
import { success } from "@/lib/utils/responses";

const projectsService = new ProjectsService();

export async function GET() {
  try {
    const tags = await projectsService.getUniqueTags();
    return success(tags);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

