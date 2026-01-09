import { NextRequest, NextResponse } from "next/server";
import { LikesService } from "@/lib/services/likes.service";
import { requireAuth } from "@/lib/middleware/auth";
import { success, error } from "@/lib/utils/responses";
import { z } from "zod";

const likesService = new LikesService();

const likeInputSchema = z.object({
  isLike: z.coerce.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { isLike } = likeInputSchema.parse(body);
    const like = await likesService.likePerson(user.id, params.id, isLike);
    return success(like, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return error(err.issues[0]?.message || "Validation error", 400);
    }
    return error("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await likesService.unlikePerson(user.id, params.id);
    return success({ message: "Unliked successfully" });
  } catch (err) {
    return error("Internal server error", 500);
  }
}


