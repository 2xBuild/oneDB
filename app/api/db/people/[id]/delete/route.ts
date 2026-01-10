import { NextRequest, NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { requireAuth } from "@/lib/middleware/auth";
import { success, error } from "@/lib/utils/responses";

const peopleService = new PeopleService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const contribution = await peopleService.submitDelete(user.id, id);
    return success(contribution, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Can only delete")) {
      return error(err.message, 400);
    }
    return error("Internal server error", 500);
  }
}

