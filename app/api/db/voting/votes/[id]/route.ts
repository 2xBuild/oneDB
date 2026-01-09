import { NextRequest, NextResponse } from "next/server";
import { VotesService } from "@/lib/services/votes.service";
import { requireAuth } from "@/lib/middleware/auth";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const votesService = new VotesService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    await votesService.removeVote(user.id, id);
    return success({ message: "Vote removed successfully" });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error("Internal server error", 500);
  }
}


