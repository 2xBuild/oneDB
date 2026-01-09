import { NextRequest, NextResponse } from "next/server";
import { CommentsService } from "@/lib/services/comments.service";
import { success } from "@/lib/utils/responses";

const commentsService = new CommentsService();

export async function GET(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  try {
    const comments = await commentsService.findByIdea(params.ideaId);
    return success(comments);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

