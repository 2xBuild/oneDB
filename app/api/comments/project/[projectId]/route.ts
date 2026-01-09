import { NextRequest, NextResponse } from "next/server";
import { CommentsService } from "@/lib/services/comments.service";
import { success } from "@/lib/utils/responses";

const commentsService = new CommentsService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const comments = await commentsService.findByProject(projectId);
    return success(comments);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

