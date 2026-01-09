import { NextRequest, NextResponse } from "next/server";
import { LikesService } from "@/lib/services/likes.service";
import { success } from "@/lib/utils/responses";

const likesService = new LikesService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aggregation = await likesService.getResourceLikeAggregation(id);
    return success(aggregation);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


